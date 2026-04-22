"""
ViralBoard Phase 1 Fetcher
- 트랙 1: 카테고리 mostPopular (KR, 5종)
- 트랙 2: 참고 채널 추적 (5개)
- oEmbed로 실제 영상 비율 판별 (위장 Shorts 탐지)
"""
import os, sys, re, requests
from datetime import datetime, date
from supabase import create_client
from dotenv import load_dotenv

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
    'education':     '27',
}

REFERENCE_CHANNELS = [
    {'id': 'UCsXVk37bltHxD1rDPwtNM8Q', 'name': 'Kurzgesagt',        'style_tag': '3d_anim_info'},
    {'id': 'UCvz84_Q0BbvZThy75mbd-Dg', 'name': 'Zack D. Films',     'style_tag': '3d_anim_short'},
    {'id': 'UCfK9_7pC_S1fX3C2kOshV_w', 'name': 'Primate Economics',  'style_tag': 'econ_explainer'},
    {'id': 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', 'name': 'GymCoding',         'style_tag': 'tech_info_kr'},
    {'id': 'UCU5Bngb-griCg_96ZXpXOgg', 'name': 'Kimhamzzi',          'style_tag': 'hybrid_vlog_series'},
]

COUNTRY = 'KR'
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


def fetch_oembed(video_id):
    """quota 0. 실패해도 None 반환."""
    try:
        url = (
            f'https://www.youtube.com/oembed'
            f'?url=https://www.youtube.com/watch?v={video_id}&format=json'
        )
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            d = r.json()
            return d.get('width'), d.get('height')
    except Exception:
        pass
    return None, None


def fetch_category(cat_id):
    """videos.list mostPopular — 1 unit"""
    r = requests.get('https://www.googleapis.com/youtube/v3/videos', params={
        'part': 'snippet,statistics,contentDetails',
        'chart': 'mostPopular',
        'regionCode': COUNTRY,
        'videoCategoryId': cat_id,
        'maxResults': PER_CATEGORY,
        'key': next_key(),
    }, timeout=30)
    r.raise_for_status()
    return r.json().get('items', [])


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


def to_record(item, category, country, ref=False, style=None):
    s  = item.get('snippet', {})
    st = item.get('statistics', {})
    c  = item.get('contentDetails', {})
    vid = item['id']
    w, h = fetch_oembed(vid)

    return {
        'video_id':          vid,
        'category':          category,
        'country':           country,
        'title':             s.get('title'),
        'channel':           s.get('channelTitle'),
        'channel_id':        s.get('channelId'),
        'views':             int(st.get('viewCount',  0) or 0),
        'likes':             int(st.get('likeCount',  0) or 0),
        'comments':          int(st.get('commentCount', 0) or 0),
        'duration_seconds':  parse_duration(c.get('duration')),
        'published_at':      s.get('publishedAt'),
        'tags':              s.get('tags', []),
        'thumbnail_url':     s.get('thumbnails', {}).get('high', {}).get('url'),
        'reference_channel': ref,
        'style_tag':         style,
        'actual_width':      w,
        'actual_height':     h,
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
        'reference_channel': r['reference_channel'],
        'style_tag':         r['style_tag'],
        'actual_width':      r['actual_width'],
        'actual_height':     r['actual_height'],
    } for r in records]
    supabase.table('viralboard_history').insert(history).execute()
    return len(records)


def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    total = 0
    fails = []

    print(f'=== Phase 1 Fetcher {datetime.utcnow().isoformat()} ===')

    # 트랙 1: 카테고리
    print('--- 트랙 1: 카테고리 ---')
    for name, cid in CATEGORIES.items():
        try:
            items = fetch_category(cid)
            recs = [to_record(i, name, COUNTRY) for i in items]
            n = save(sb, recs)
            total += n
            print(f'  {name}: {n}건')
        except Exception as e:
            fails.append(f'category:{name} → {e}')
            print(f'  [FAIL] {name}: {e}')

    # 트랙 2: 참고 채널
    print('--- 트랙 2: 참고 채널 ---')
    for ch in REFERENCE_CHANNELS:
        try:
            items = fetch_channel_recent(ch['id'])
            recs = [to_record(i, ch['style_tag'], COUNTRY, True, ch['style_tag']) for i in items]
            n = save(sb, recs)
            total += n
            print(f'  {ch["name"]}: {n}건')
        except Exception as e:
            fails.append(f'channel:{ch["name"]} → {e}')
            print(f'  [FAIL] {ch["name"]}: {e}')

    print(f'\n=== 완료: {total}건 저장 / 실패: {len(fails)} ===')
    for f in fails:
        print(f'  {f}')


if __name__ == '__main__':
    main()
