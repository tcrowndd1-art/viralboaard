"""
ViralBoard Track 2 — 고CPM 키워드 채널 수집
search.list(type=channel, q=keyword) → channels.list → viralboard_cpm_channels upsert

필요 테이블 (Supabase에서 한 번 생성):
  CREATE TABLE viralboard_cpm_channels (
    channel_id           TEXT,
    keyword_niche        TEXT,
    keyword              TEXT,
    country              TEXT,
    language             TEXT,
    estimated_cpm        INT,
    channel_name         TEXT,
    subscriber_count     BIGINT,
    total_view_count     BIGINT,
    video_count          INT,
    thumbnail_url        TEXT,
    snapshot_date        DATE,
    PRIMARY KEY (channel_id, keyword_niche)
  );
"""
import os, sys, re, requests
from datetime import datetime, date, timezone
from supabase import create_client
from dotenv import load_dotenv
from cpm_keywords import HIGH_CPM_KEYWORDS, PER_KEYWORD


def mask_secrets(text):
    text = str(text)
    text = re.sub(r'(key=)[A-Za-z0-9_-]+', r'\1***MASKED***', text)
    text = re.sub(r'(token=)[A-Za-z0-9_-]+', r'\1***MASKED***', text)
    text = re.sub(r'(Bearer\s+)[A-Za-z0-9_.-]+', r'\1***MASKED***', text)
    text = re.sub(r'AIza[A-Za-z0-9_-]{20,}', '***MASKED***', text)
    text = re.sub(r'sb_secret_[A-Za-z0-9_-]+', '***MASKED***', text)
    text = re.sub(r'eyJ[A-Za-z0-9_.-]{20,}', '***MASKED***', text)
    return text


env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(env_path)

API_KEYS = [k for k in [os.getenv(f'YOUTUBE_API_KEY_{i}') for i in range(1, 10)] if k]
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not API_KEYS or not SUPABASE_URL or not SUPABASE_KEY:
    print('[FATAL] 환경변수 누락')
    sys.exit(1)

_key_idx = 0
def next_key():
    global _key_idx
    k = API_KEYS[_key_idx % len(API_KEYS)]
    _key_idx += 1
    return k


def search_channels(keyword, country, language):
    """search.list(type=channel) → channel_id 목록 (100 units)"""
    r = requests.get('https://www.googleapis.com/youtube/v3/search', params={
        'part': 'id,snippet',
        'type': 'channel',
        'q': keyword,
        'regionCode': country,
        'relevanceLanguage': language,
        'maxResults': PER_KEYWORD,
        'key': next_key(),
    }, timeout=30)
    r.raise_for_status()
    return [item['id']['channelId'] for item in r.json().get('items', []) if item.get('id', {}).get('channelId')]


def fetch_channel_details(channel_ids):
    """channels.list → statistics + snippet (1 unit/50)"""
    if not channel_ids:
        return []
    result = []
    for i in range(0, len(channel_ids), 50):
        batch = channel_ids[i:i+50]
        try:
            r = requests.get('https://www.googleapis.com/youtube/v3/channels', params={
                'part': 'snippet,statistics',
                'id': ','.join(batch),
                'key': next_key(),
            }, timeout=30)
            r.raise_for_status()
            for item in r.json().get('items', []):
                st = item.get('statistics', {})
                sn = item.get('snippet', {})
                result.append({
                    'channel_id':       item['id'],
                    'channel_name':     sn.get('title', ''),
                    'thumbnail_url':    sn.get('thumbnails', {}).get('default', {}).get('url', ''),
                    'subscriber_count': int(st.get('subscriberCount', 0) or 0),
                    'total_view_count': int(st.get('viewCount',        0) or 0),
                    'video_count':      int(st.get('videoCount',        0) or 0),
                })
        except Exception as e:
            print(f'  [WARN] channels.list 배치 실패: {mask_secrets(e)[:150]}')
    return result


def save(supabase, records):
    if not records:
        return 0
    seen = set()
    unique = []
    for r in records:
        key = (r['channel_id'], r['keyword_niche'])
        if key in seen:
            continue
        seen.add(key)
        unique.append(r)

    supabase.table('viralboard_cpm_channels').upsert(
        unique, on_conflict='channel_id,keyword_niche'
    ).execute()
    return len(unique)


def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    all_records = []
    fails = []
    today = str(date.today())

    print(f'=== Track 2 CPM Channel Fetcher {datetime.now(timezone.utc).isoformat()} ===')
    print(f'  {len(HIGH_CPM_KEYWORDS)} niches × {PER_KEYWORD} channels')

    for niche, pairs in HIGH_CPM_KEYWORDS.items():
        print(f'  [{niche}]')
        for keyword, country, language, cpm in pairs:
            try:
                channel_ids = search_channels(keyword, country, language)
                if not channel_ids:
                    print(f'    "{keyword}" ({country}): 0건')
                    continue
                channels = fetch_channel_details(channel_ids)
                for ch in channels:
                    all_records.append({
                        **ch,
                        'niche':           niche,   # NOT NULL 컬럼 (기존 스키마)
                        'keyword_niche':   niche,   # migration으로 추가된 PK 컬럼
                        'keyword':         keyword,
                        'country':         country,
                        'language':        language,
                        'estimated_cpm':   cpm,
                        'snapshot_date':   today,
                    })
                print(f'    "{keyword}" ({country}): {len(channels)}건')
            except Exception as e:
                fails.append(f'cpm:{niche}/{country} "{keyword}" → {mask_secrets(e)}')
                print(f'    [FAIL] "{keyword}" ({country}): {mask_secrets(e)[:100]}')

    total = save(sb, all_records)

    print(f'\n=== 완료: {total}건 저장 / 실패: {len(fails)} ===')
    for f in fails:
        print(f'  {f}')


if __name__ == '__main__':
    main()
