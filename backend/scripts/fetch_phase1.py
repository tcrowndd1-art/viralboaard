"""
ViralBoard Phase 1 Fetcher
- 트랙 1: 카테고리 mostPopular (KR/US/JP/BR, 5종)
- 트랙 2: 참고 채널 추적 (5개, 국가 무관 — reference 태그)
"""
import os, sys, re, requests
from datetime import datetime, date, timezone
from supabase import create_client
from dotenv import load_dotenv


def mask_secrets(text):
    """URL의 key=, token=, bearer 등 자동 마스킹"""
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

API_KEYS = [k for k in [
    os.getenv('YOUTUBE_API_KEY_1'),
    os.getenv('YOUTUBE_API_KEY_2'),
    os.getenv('YOUTUBE_API_KEY_3'),
] if k]

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not API_KEYS or not SUPABASE_URL or not SUPABASE_KEY:
    print('[FATAL] 환경변수 누락')
    sys.exit(1)

CATEGORIES = {
    'people_blogs':  '22',
    'entertainment': '24',
    'news_politics': '25',
    'howto_style':   '26',
    'science_tech':  '28',
}

REFERENCE_CHANNELS = [
    {'id': 'UCsXVk37bltHxD1rDPwtNM8Q', 'name': 'Kurzgesagt',        'style_tag': '3d_anim_info'},
    {'id': 'UCvz84_Q0BbvZThy75mbd-Dg', 'name': 'Zack D. Films',     'style_tag': '3d_anim_short'},
    {'id': 'UC14Fb2zWTEZklONPXFbLrTQ', 'name': 'Primate Economics',  'style_tag': 'econ_explainer'},
    {'id': 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', 'name': 'GymCoding',         'style_tag': 'tech_info_kr'},
    {'id': 'UCU5Bngb-griCg_96ZXpXOgg', 'name': 'Kimhamzzi',          'style_tag': 'hybrid_vlog_series'},
]

COUNTRIES = ['KR', 'US', 'JP', 'BR']
PER_CATEGORY = 5
PER_CHANNEL = 5

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


def fetch_category(cat_id, country):
    """videos.list mostPopular — 1 unit"""
    r = requests.get('https://www.googleapis.com/youtube/v3/videos', params={
        'part': 'snippet,statistics,contentDetails',
        'chart': 'mostPopular',
        'regionCode': country,
        'videoCategoryId': cat_id,
        'maxResults': PER_CATEGORY,
        'key': next_key(),
    }, timeout=30)
    r.raise_for_status()
    return r.json().get('items', [])


def fetch_channel_details(channel_ids):
    """여러 channel_id → subscribers + thumbnail (quota: 1 unit/50채널)"""
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
                    'subscriber_count':    int(st.get('subscriberCount', 0) or 0),
                    'channel_thumbnail_url': sn.get('thumbnails', {}).get('default', {}).get('url', ''),
                }
        except Exception as e:
            print(f'  [WARN] channels.list 배치 실패: {mask_secrets(e)[:150]}')
    return result


def fetch_channel_recent(channel_id):
    """채널 업로드 플레이리스트 → 최근 영상 (~3 units)"""
    r1 = requests.get('https://www.googleapis.com/youtube/v3/channels', params={
        'part': 'contentDetails',
        'id': channel_id,
        'key': next_key(),
    }, timeout=30)
    r1.raise_for_status()
    items = r1.json().get('items', [])
    if not items:
        return []
    uploads_id = items[0]['contentDetails']['relatedPlaylists']['uploads']

    r2 = requests.get('https://www.googleapis.com/youtube/v3/playlistItems', params={
        'part': 'contentDetails',
        'playlistId': uploads_id,
        'maxResults': PER_CHANNEL,
        'key': next_key(),
    }, timeout=30)
    r2.raise_for_status()
    video_ids = [i['contentDetails']['videoId'] for i in r2.json().get('items', [])]

    if not video_ids:
        return []
    r3 = requests.get('https://www.googleapis.com/youtube/v3/videos', params={
        'part': 'snippet,statistics,contentDetails',
        'id': ','.join(video_ids),
        'key': next_key(),
    }, timeout=30)
    r3.raise_for_status()
    return r3.json().get('items', [])


def to_record(item, category, country, ref=False, style=None, ch_details=None):
    s  = item.get('snippet', {})
    st = item.get('statistics', {})
    c  = item.get('contentDetails', {})
    vid = item['id']
    ch_id = s.get('channelId')
    detail = (ch_details or {}).get(ch_id, {})

    return {
        'video_id':              vid,
        'category':              category,
        'country':               country,
        'title':                 s.get('title'),
        'channel':               s.get('channelTitle'),
        'channel_id':            ch_id,
        'views':                 int(st.get('viewCount',  0) or 0),
        'likes':                 int(st.get('likeCount',  0) or 0),
        'comments':              int(st.get('commentCount', 0) or 0),
        'duration_seconds':      parse_duration(c.get('duration')),
        'published_at':          s.get('publishedAt'),
        'tags':                  s.get('tags', []),
        'thumbnail_url':         s.get('thumbnails', {}).get('medium', {}).get('url'),
        'reference_channel':     ref,
        'style_tag':             style,
        'subscriber_count':      detail.get('subscriber_count'),
        'channel_thumbnail_url': detail.get('channel_thumbnail_url'),
    }


def save(supabase, records):
    if not records:
        return 0
    supabase.table('viralboard_data').upsert(
        records, on_conflict='video_id,country'
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
        'reference_channel':     r['reference_channel'],
        'style_tag':             r['style_tag'],
        'subscriber_count':      r.get('subscriber_count'),
    } for r in records]
    supabase.table('viralboard_history').insert(history).execute()
    return len(records)


def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    all_items   = []  # (item, category, country, ref, style)
    fails       = []

    print(f'=== Phase 1 Fetcher {datetime.now(timezone.utc).isoformat()} ===')

    # 트랙 1: 카테고리 수집 (4국가)
    print(f'--- 트랙 1: 카테고리 수집 ({len(COUNTRIES)}국가) ---')
    for country in COUNTRIES:
        print(f'  [{country}]')
        for name, cid in CATEGORIES.items():
            try:
                items = fetch_category(cid, country)
                for i in items:
                    all_items.append((i, name, country, False, None))
                print(f'    {name}: {len(items)}건')
            except Exception as e:
                fails.append(f'category:{country}/{name} → {mask_secrets(e)}')
                print(f'    [FAIL] {name}: {mask_secrets(e)}')

    # 트랙 2: 참고 채널 수집 (국가 무관, 1번만 → 'KR' 태그 유지)
    print('--- 트랙 2: 참고 채널 수집 ---')
    for ch in REFERENCE_CHANNELS:
        try:
            items = fetch_channel_recent(ch['id'])
            for i in items:
                all_items.append((i, 'reference', 'KR', True, ch['style_tag']))
            print(f'  {ch["name"]}: {len(items)}건')
        except Exception as e:
            fails.append(f'channel:{ch["name"]} → {mask_secrets(e)}')
            print(f'  [FAIL] {ch["name"]}: {mask_secrets(e)}')

    # 채널 상세 일괄 조회 (subscriber + avatar)
    unique_ch_ids = list({
        i.get('snippet', {}).get('channelId')
        for (i, _, _, _, _) in all_items
        if i.get('snippet', {}).get('channelId')
    })
    print(f'--- 채널 상세 조회: {len(unique_ch_ids)}개 채널 ---')
    ch_details = fetch_channel_details(unique_ch_ids)
    print(f'  응답: {len(ch_details)}개')

    # 레코드 변환 + 저장
    recs = [to_record(i, cat, country, ref, style, ch_details)
            for (i, cat, country, ref, style) in all_items]
    total = save(sb, recs)

    print(f'\n=== 완료: {total}건 저장 / 실패: {len(fails)} ===')
    for f in fails:
        print(f'  {f}')


if __name__ == '__main__':
    main()
