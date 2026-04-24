"""
ViralBoard Track 4 — 니치 키워드 영상 수집
search.list(type=video, q=keyword) → videos.list → viralboard_data upsert
"""
import os, sys, re, requests
from datetime import datetime, date, timezone
from supabase import create_client
from dotenv import load_dotenv
from niche_keywords import NICHE_KEYWORDS, PER_KEYWORD


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


def parse_duration(s):
    if not s:
        return 0
    m = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', s)
    if not m:
        return 0
    h, mi, se = m.groups()
    return int(h or 0) * 3600 + int(mi or 0) * 60 + int(se or 0)


_COUNTRY_LANG = {
    'KR': 'ko', 'JP': 'ja', 'TW': 'zh', 'VN': 'vi', 'TH': 'th',
    'ID': 'id', 'IN': 'hi', 'HK': 'zh', 'SG': 'en', 'US': 'en',
    'CA': 'en', 'GB': 'en', 'AU': 'en', 'BR': 'pt', 'MX': 'es',
    'AR': 'es', 'DE': 'de', 'FR': 'fr', 'ES': 'es', 'PT': 'pt',
    'RU': 'ru',
}

def search_videos(keyword, country):
    """search.list → video_id 목록 (100 units)"""
    r = requests.get('https://www.googleapis.com/youtube/v3/search', params={
        'part': 'id',
        'type': 'video',
        'q': keyword,
        'regionCode': country,
        'relevanceLanguage': _COUNTRY_LANG.get(country, 'en'),
        'maxResults': PER_KEYWORD,
        'order': 'viewCount',
        'key': next_key(),
    }, timeout=30)
    r.raise_for_status()
    return [item['id']['videoId'] for item in r.json().get('items', [])]


def fetch_video_details(video_ids):
    """videos.list → snippet,statistics,contentDetails (1 unit/50)"""
    if not video_ids:
        return []
    r = requests.get('https://www.googleapis.com/youtube/v3/videos', params={
        'part': 'snippet,statistics,contentDetails',
        'id': ','.join(video_ids),
        'key': next_key(),
    }, timeout=30)
    r.raise_for_status()
    return r.json().get('items', [])


def fetch_channel_details(channel_ids):
    """channels.list → subscriber_count, thumbnail"""
    if not channel_ids:
        return {}
    result = {}
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
                ch_id = item['id']
                st = item.get('statistics', {})
                sn = item.get('snippet', {})
                result[ch_id] = {
                    'subscriber_count':      int(st.get('subscriberCount', 0) or 0),
                    'channel_thumbnail_url': sn.get('thumbnails', {}).get('default', {}).get('url', ''),
                }
        except Exception as e:
            print(f'  [WARN] channels.list 배치 실패: {mask_secrets(e)[:150]}')
    return result


def to_record(item, niche, country, ch_details):
    s  = item.get('snippet', {})
    st = item.get('statistics', {})
    c  = item.get('contentDetails', {})
    vid = item['id']
    ch_id = s.get('channelId')
    detail = ch_details.get(ch_id, {})
    return {
        'video_id':              vid,
        'category':              f'niche_{niche}',
        'country':               country,
        'title':                 s.get('title'),
        'channel':               s.get('channelTitle'),
        'channel_id':            ch_id,
        'views':                 int(st.get('viewCount',   0) or 0),
        'likes':                 int(st.get('likeCount',   0) or 0),
        'comments':              int(st.get('commentCount', 0) or 0),
        'duration_seconds':      parse_duration(c.get('duration')),
        'published_at':          s.get('publishedAt'),
        'tags':                  s.get('tags', []),
        'thumbnail_url':         s.get('thumbnails', {}).get('medium', {}).get('url'),
        'reference_channel':     False,
        'style_tag':             niche,
        'subscriber_count':      detail.get('subscriber_count'),
        'channel_thumbnail_url': detail.get('channel_thumbnail_url'),
    }


def save(supabase, records):
    if not records:
        return 0
    seen = set()
    unique = []
    for r in records:
        key = (r['video_id'], r['country'])
        if key in seen:
            continue
        seen.add(key)
        unique.append(r)

    supabase.table('viralboard_data').upsert(
        unique, on_conflict='video_id,country'
    ).execute()

    today = str(date.today())
    history = [{
        'video_id':          r['video_id'],
        'category':          r['category'],
        'country':           r['country'],
        'title':             r['title'],
        'channel':           r['channel'],
        'views':             r['views'],
        'likes':             r['likes'],
        'comments':          r['comments'],
        'duration_seconds':  r['duration_seconds'],
        'published_at':      r['published_at'],
        'snapshot_date':     today,
        'reference_channel': r['reference_channel'],
        'style_tag':         r['style_tag'],
        'subscriber_count':  r.get('subscriber_count'),
        'thumbnail_url':     r.get('thumbnail_url'),
    } for r in unique]
    supabase.table('viralboard_history').insert(history).execute()
    return len(unique)


def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    all_items = []
    fails = []

    print(f'=== Track 4 Niche Fetcher {datetime.now(timezone.utc).isoformat()} ===')
    print(f'  {len(NICHE_KEYWORDS)} niches × {PER_KEYWORD} results')

    for niche, pairs in NICHE_KEYWORDS.items():
        print(f'  [{niche}]')
        for keyword, country in pairs:
            try:
                video_ids = search_videos(keyword, country)
                if not video_ids:
                    print(f'    "{keyword}" ({country}): 0건')
                    continue
                items = fetch_video_details(video_ids)
                for item in items:
                    all_items.append((item, niche, country))
                print(f'    "{keyword}" ({country}): {len(items)}건')
            except Exception as e:
                fails.append(f'niche:{niche}/{country} "{keyword}" → {mask_secrets(e)}')
                print(f'    [FAIL] "{keyword}" ({country}): {mask_secrets(e)[:100]}')

    # 채널 상세 일괄 조회
    unique_ch_ids = list({
        item.get('snippet', {}).get('channelId')
        for (item, _, _) in all_items
        if item.get('snippet', {}).get('channelId')
    })
    print(f'--- 채널 상세 조회: {len(unique_ch_ids)}개 ---')
    ch_details = fetch_channel_details(unique_ch_ids)

    recs = [to_record(item, niche, country, ch_details) for (item, niche, country) in all_items]
    total = save(sb, recs)

    print(f'\n=== 완료: {total}건 저장 / 실패: {len(fails)} ===')
    for f in fails:
        print(f'  {f}')


if __name__ == '__main__':
    main()
