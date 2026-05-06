"""
ViralBoard Phase 1 Fetcher
- ÃƒÂ­Ã…Â Ã‚Â¸ÃƒÂ«Ã…Â¾Ã¢â€žÂ¢ 1: ÃƒÂ¬Ã‚Â¹Ã‚Â´ÃƒÂ­Ã¢â‚¬Â¦Ã…â€™ÃƒÂªÃ‚Â³Ã‚Â ÃƒÂ«Ã‚Â¦Ã‚Â¬ mostPopular (KR/US/JP/BR, 5ÃƒÂ¬Ã‚Â¢Ã¢â‚¬Â¦)
- ÃƒÂ­Ã…Â Ã‚Â¸ÃƒÂ«Ã…Â¾Ã¢â€žÂ¢ 2: ÃƒÂ¬Ã‚Â°Ã‚Â¸ÃƒÂªÃ‚Â³Ã‚Â  ÃƒÂ¬Ã‚Â±Ã¢â‚¬Å¾ÃƒÂ«Ã¢â‚¬Å¾Ã‚Â ÃƒÂ¬Ã‚Â¶Ã¢â‚¬ÂÃƒÂ¬Ã‚Â Ã‚Â (5ÃƒÂªÃ‚Â°Ã…â€œ, ÃƒÂªÃ‚ÂµÃ‚Â­ÃƒÂªÃ‚Â°Ã¢â€šÂ¬ ÃƒÂ«Ã‚Â¬Ã‚Â´ÃƒÂªÃ‚Â´Ã¢â€šÂ¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â reference ÃƒÂ­Ã†â€™Ã…â€œÃƒÂªÃ‚Â·Ã‚Â¸)
"""
import os, sys, re, requests
from datetime import datetime, date, timezone
from supabase import create_client
from dotenv import load_dotenv


def mask_secrets(text):
    """URLÃƒÂ¬Ã‚ÂÃ‹Å“ key=, token=, bearer ÃƒÂ«Ã¢â‚¬Å“Ã‚Â± ÃƒÂ¬Ã…Â¾Ã‚ÂÃƒÂ«Ã‚ÂÃ¢â€žÂ¢ ÃƒÂ«Ã‚Â§Ã‹â€ ÃƒÂ¬Ã…Â Ã‚Â¤ÃƒÂ­Ã¢â‚¬Å¡Ã‚Â¹"""
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
    os.getenv(f'YOUTUBE_API_KEY_{i}')
    for i in range(1, 10)
] if k]
print(f'[INFO] YouTube API ÃƒÂ­Ã¢â‚¬Å¡Ã‚Â¤ ÃƒÂ«Ã‚Â¡Ã…â€œÃƒÂ«Ã¢â‚¬Å“Ã…â€œ: {len(API_KEYS)}ÃƒÂªÃ‚Â°Ã…â€œ')

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not API_KEYS or not SUPABASE_URL or not SUPABASE_KEY:
    print('[FATAL] ÃƒÂ­Ã¢â€žÂ¢Ã‹Å“ÃƒÂªÃ‚Â²Ã‚Â½ÃƒÂ«Ã‚Â³Ã¢â€šÂ¬ÃƒÂ¬Ã‹â€ Ã‹Å“ ÃƒÂ«Ã‹â€ Ã¢â‚¬Å¾ÃƒÂ«Ã‚ÂÃ‚Â½')
    sys.exit(1)

CATEGORIES = {
    # ÃƒÂªÃ‚Â¸Ã‚Â°ÃƒÂ¬Ã‚Â¡Ã‚Â´ 12
    'people_blogs':   '22',
    'entertainment':  '24',
    'news_politics':  '25',
    'howto_style':    '26',
    'science_tech':   '28',
    'music':          '10',
    'gaming':         '20',
    'sports':         '17',
    'film_animation': '1',
    'autos_vehicles': '2',
    'pets_animals':   '15',
    'comedy':         '23',
    # ÃƒÂ¬Ã‚Â¶Ã¢â‚¬ÂÃƒÂªÃ‚Â°Ã¢â€šÂ¬ (mostPopular ÃƒÂ¬Ã‚Â§Ã¢â€šÂ¬ÃƒÂ¬Ã¢â‚¬ÂºÃ‚Â ÃƒÂ­Ã¢â€žÂ¢Ã¢â‚¬Â¢ÃƒÂ¬Ã‚ÂÃ‚Â¸ÃƒÂ«Ã‚ÂÃ…â€œ ÃƒÂªÃ‚Â²Ã†â€™ÃƒÂ«Ã‚Â§Ã…â€™)
    'nonprofits':     '29',
    # shows/43, trailers/44, short_movies/18 ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ 400 (mostPopular ÃƒÂ«Ã‚Â¯Ã‚Â¸ÃƒÂ¬Ã‚Â§Ã¢â€šÂ¬ÃƒÂ¬Ã¢â‚¬ÂºÃ‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ÃƒÂ¬Ã‹Å“Ã‚ÂÃƒÂªÃ‚ÂµÃ‚Â¬ ÃƒÂ¬Ã‚Â Ã…â€œÃƒÂªÃ‚Â±Ã‚Â°)
    # travel_events/19, education/27 ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ 404 ÃƒÂ¬Ã‚Â Ã¢â‚¬Å¾ÃƒÂªÃ‚ÂµÃ‚Â­ÃƒÂªÃ‚Â°Ã¢â€šÂ¬ (ÃƒÂ¬Ã‹Å“Ã‚ÂÃƒÂªÃ‚ÂµÃ‚Â¬ ÃƒÂ¬Ã‚Â Ã…â€œÃƒÂªÃ‚Â±Ã‚Â°)
}

REFERENCE_CHANNELS = [
    {'id': 'UCsXVk37bltHxD1rDPwtNM8Q', 'name': 'Kurzgesagt',        'style_tag': '3d_anim_info'},
    {'id': 'UCvz84_Q0BbvZThy75mbd-Dg', 'name': 'Zack D. Films',     'style_tag': '3d_anim_short'},
    {'id': 'UC14Fb2zWTEZklONPXFbLrTQ', 'name': 'Primate Economics',  'style_tag': 'econ_explainer'},
    {'id': 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', 'name': 'GymCoding',         'style_tag': 'tech_info_kr'},
    {'id': 'UCU5Bngb-griCg_96ZXpXOgg', 'name': 'Kimhamzzi',          'style_tag': 'hybrid_vlog_series'},
]

PRIORITY_COUNTRIES = ['KR', 'US', 'BR']
SECONDARY_COUNTRIES = [
    'JP', 'TW', 'VN', 'TH', 'ID', 'IN', 'HK', 'SG', 'LA',
    'CA', 'MX', 'AR', 'CL', 'PE', 'CO',
    'GB', 'DE', 'FR', 'ES', 'PT', 'RU',
]
COUNTRIES = PRIORITY_COUNTRIES + SECONDARY_COUNTRIES
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
    """videos.list mostPopular ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 1 unit"""
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
    """ÃƒÂ¬Ã¢â‚¬â€Ã‚Â¬ÃƒÂ«Ã…Â¸Ã‚Â¬ channel_id ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ subscribers + thumbnail (quota: 1 unit/50ÃƒÂ¬Ã‚Â±Ã¢â‚¬Å¾ÃƒÂ«Ã¢â‚¬Å¾Ã‚Â)"""
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
            print(f'  [WARN] channels.list ÃƒÂ«Ã‚Â°Ã‚Â°ÃƒÂ¬Ã‚Â¹Ã‹Å“ ÃƒÂ¬Ã¢â‚¬Â¹Ã‚Â¤ÃƒÂ­Ã…â€™Ã‚Â¨: {mask_secrets(e)[:150]}')
    return result


def fetch_channel_recent(channel_id):
    """ÃƒÂ¬Ã‚Â±Ã¢â‚¬Å¾ÃƒÂ«Ã¢â‚¬Å¾Ã‚Â ÃƒÂ¬Ã¢â‚¬â€Ã¢â‚¬Â¦ÃƒÂ«Ã‚Â¡Ã…â€œÃƒÂ«Ã¢â‚¬Å“Ã…â€œ ÃƒÂ­Ã¢â‚¬ÂÃ…â€™ÃƒÂ«Ã‚Â Ã‹â€ ÃƒÂ¬Ã‚ÂÃ‚Â´ÃƒÂ«Ã‚Â¦Ã‚Â¬ÃƒÂ¬Ã…Â Ã‚Â¤ÃƒÂ­Ã…Â Ã‚Â¸ ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ÃƒÂ¬Ã‚ÂµÃ…â€œÃƒÂªÃ‚Â·Ã‚Â¼ ÃƒÂ¬Ã‹Å“Ã‚ÂÃƒÂ¬Ã†â€™Ã‚Â (~3 units)"""
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
        'fetched_at':            datetime.now(timezone.utc).isoformat(),
    }


def save(supabase, records):
    if not records:
        return 0
    # Dedup by (video_id, country) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â same video can appear in multiple categories
    seen = set()
    unique = []
    for r in records:
        key = (r['video_id'], r['country'])
        if key in seen:
            continue
        seen.add(key)
        unique.append(r)

    supabase.table('viralboard_data').upsert(
        unique, on_conflict='video_id,country', ignore_duplicates=False
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
        'thumbnail_url':         r.get('thumbnail_url'),
    } for r in unique]
    supabase.table('viralboard_history').insert(history).execute()
    return len(unique)



# Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Ã¬â€¹Â Ã¬â€žÂ Ã«Ââ€ž Ã­Å Â¸Ã«Å¾â„¢ (24h Ã¬ÂÂ´Ã«â€šÂ´ Ã¬â€¹Â ÃªÂ·Å“ Ã«â€“Â¡Ã¬Æ’Â Ã¬ËœÂÃ¬Æ’Â) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
def fetch_fresh_videos(country, hours=24, max_results=20):
    """search.list (100u) + videos.list (1u) Ã¢â‚¬â€ Ã­â€¢Å“ ÃªÂµÂ­ÃªÂ°â‚¬Ã«â€¹Â¹ ~101 units"""
    from datetime import timedelta
    published_after = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()

    r = requests.get('https://www.googleapis.com/youtube/v3/search', params={
        'part': 'snippet',
        'type': 'video',
        'order': 'viewCount',
        'regionCode': country,
        'publishedAfter': published_after,
        'maxResults': max_results,
        'key': next_key(),
    }, timeout=30)
    r.raise_for_status()

    items = r.json().get('items', [])
    video_ids = [i['id']['videoId'] for i in items if i.get('id', {}).get('videoId')]
    if not video_ids:
        return []

    r2 = requests.get('https://www.googleapis.com/youtube/v3/videos', params={
        'part': 'snippet,statistics,contentDetails',
        'id': ','.join(video_ids),
        'key': next_key(),
    }, timeout=30)
    r2.raise_for_status()
    return r2.json().get('items', [])


def fetch_fresh_track(supabase):
    """
    24ÃªÂ°Å“ÃªÂµÂ­ Ã¬â€¹Â Ã¬â€žÂ Ã«Ââ€ž Ã­Å Â¸Ã«Å¾â„¢
    - PRIORITY 3ÃªÂ°Å“ÃªÂµÂ­ (KR/US/BR): 25ÃªÂ°Å“Ã¬â€Â© Ã¢â‚¬â€ Ã«Â¬Â´Ã¬Â¡Â°ÃªÂ±Â´ Ã¬â€¹Â¤Ã­â€“â€°
    - SECONDARY 21ÃªÂ°Å“ÃªÂµÂ­: 15ÃªÂ°Å“Ã¬â€Â© Ã¢â‚¬â€ quota Ã¬â€”ÂÃ«Å¸Â¬ Ã¬â€¹Å“ Ã¬Â¦â€°Ã¬â€¹Å“ Ã¬Â¤â€˜Ã«â€¹Â¨
    """
    print('\n--- Ã¬â€¹Â Ã¬â€žÂ Ã«Ââ€ž Ã­Å Â¸Ã«Å¾â„¢ (24h Ã¬ÂÂ´Ã«â€šÂ´ Ã¬â€¹Â ÃªÂ·Å“ Ã«â€“Â¡Ã¬Æ’Â) ---')
    fresh_records = []
    failed = []
    quota_exhausted = False

    for country in PRIORITY_COUNTRIES:
        try:
            items = fetch_fresh_videos(country, hours=24, max_results=25)
            for item in items:
                rec = to_record(item, 'fresh_24h', country, ref=False, style='fresh_track')
                rec['is_shorts'] = 0 < rec['duration_seconds'] <= 60
                fresh_records.append(rec)
            print(f'  [P] {country}: {len(items)}ÃªÂ±Â´')
        except requests.HTTPError as e:
            if e.response is not None and e.response.status_code == 403:
                quota_exhausted = True
                failed.append(f'{country}: QUOTA')
                print(f'  [QUOTA] {country} Ã¢â‚¬â€ SECONDARY Ã¬Å Â¤Ã­â€šÂµ Ã¬ËœË†Ã¬Â â€¢')
            else:
                failed.append(f'{country}: {mask_secrets(str(e))}')
                print(f'  [FAIL] {country}: {mask_secrets(str(e))}')
        except Exception as e:
            failed.append(f'{country}: {mask_secrets(str(e))}')
            print(f'  [FAIL] {country}: {mask_secrets(str(e))}')

    if not quota_exhausted:
        for country in SECONDARY_COUNTRIES:
            try:
                items = fetch_fresh_videos(country, hours=24, max_results=15)
                for item in items:
                    rec = to_record(item, 'fresh_24h', country, ref=False, style='fresh_track')
                    rec['is_shorts'] = 0 < rec['duration_seconds'] <= 60
                    fresh_records.append(rec)
                print(f'  [S] {country}: {len(items)}ÃªÂ±Â´')
            except requests.HTTPError as e:
                if e.response is not None and e.response.status_code == 403:
                    print(f'  [QUOTA] {country} Ã¢â‚¬â€ Ã«â€šËœÃ«Â¨Â¸Ã¬Â§â‚¬ SECONDARY Ã¬Â¤â€˜Ã«â€¹Â¨')
                    failed.append(f'{country}: QUOTA')
                    break
                failed.append(f'{country}: {mask_secrets(str(e))}')
                print(f'  [FAIL] {country}: {mask_secrets(str(e))}')
            except Exception as e:
                failed.append(f'{country}: {mask_secrets(str(e))}')
                print(f'  [FAIL] {country}: {mask_secrets(str(e))}')
    else:
        print('  [SKIP] PRIORITY quota Ã¬â€ Å’Ã¬Â§â€ž Ã¢â€ â€™ SECONDARY 21ÃªÂ°Å“ÃªÂµÂ­ Ã¬Å Â¤Ã­â€šÂµ')

    saved = save(supabase, fresh_records)
    print(f'  [OK] Ã¬â€¹Â Ã¬â€žÂ Ã«Ââ€ž Ã¬Â â‚¬Ã¬Å¾Â¥: {saved}ÃªÂ±Â´ (Ã¬Ë†ËœÃ¬Â§â€˜ {len(fresh_records)}ÃªÂ±Â´, Ã¬â€¹Â¤Ã­Å’Â¨ {len(failed)}ÃªÂ±Â´)')
    return saved
def migrate_to_archive(sb):
    from datetime import timedelta
    print('\n--- viral_title_archive ÃƒÂ¬Ã…Â¾Ã‚ÂÃƒÂ«Ã‚ÂÃ¢â€žÂ¢ ÃƒÂ¬Ã‚ÂÃ‚Â´ÃƒÂªÃ‚Â´Ã¢â€šÂ¬ (viral_ratio>=20, 90ÃƒÂ¬Ã‚ÂÃ‚Â¼ ÃƒÂ¬Ã‚ÂÃ‚Â´ÃƒÂ«Ã¢â‚¬Å¡Ã‚Â´) ---')
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=90)).isoformat()
        rows = sb.table('viralboard_data') \
            .select('video_id,title,channel,channel_id,category,country,views,subscriber_count,published_at,thumbnail_url,is_shorts') \
            .gte('viral_ratio', 20) \
            .gt('subscriber_count', 1000) \
            .gte('published_at', cutoff) \
            .execute().data

        if not rows:
            print('  ÃƒÂ¬Ã‚ÂÃ‚Â´ÃƒÂªÃ‚Â´Ã¢â€šÂ¬ ÃƒÂ«Ã…â€™Ã¢â€šÂ¬ÃƒÂ¬Ã†â€™Ã‚Â ÃƒÂ¬Ã¢â‚¬â€Ã¢â‚¬Â ÃƒÂ¬Ã‚ÂÃ…â€™')
            return 0

        now = datetime.now(timezone.utc)
        records = []
        for r in rows:
            sub = r.get('subscriber_count') or 0
            views_val = r.get('views') or 0
            viral_ratio = round(views_val / sub, 1) if sub > 0 else None

            days_since = None
            pub_str = r.get('published_at')
            if pub_str:
                try:
                    pub_dt = datetime.fromisoformat(pub_str.replace('Z', '+00:00'))
                    days_since = (now - pub_dt).days
                except Exception:
                    pass

            records.append({
                'video_id':             r['video_id'],
                'title':                r.get('title'),
                'channel':              r.get('channel'),
                'channel_id':           r.get('channel_id'),
                'category':             r.get('category'),
                'country':              r.get('country'),
                'views':                views_val,
                'subscriber_count':     sub,
                'viral_ratio':          viral_ratio,
                'published_at':         pub_str,
                'days_since_published': days_since,
                'thumbnail_url':        r.get('thumbnail_url'),
                'is_shorts':            r.get('is_shorts', False),
                'source':               'most_popular',
                'archived_at':          now.isoformat(),
            })

        sb.table('viral_title_archive').upsert(
            records, on_conflict='video_id,country'
        ).execute()
        print(f'  ÃƒÂ¬Ã‚ÂÃ‚Â´ÃƒÂªÃ‚Â´Ã¢â€šÂ¬ ÃƒÂ¬Ã¢â€žÂ¢Ã¢â‚¬Å¾ÃƒÂ«Ã‚Â£Ã…â€™: {len(records)}ÃƒÂªÃ‚Â±Ã‚Â´')
        return len(records)
    except Exception as e:
        print(f'  [FAIL] {mask_secrets(str(e))[:200]}')
        return 0


def main():
    import sys
    if '--fresh-only' in sys.argv:
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)
        fetch_fresh_track(sb)
        return
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    all_items   = []  # (item, category, country, ref, style)
    fails       = []

    print(f'=== Phase 1 Fetcher {datetime.now(timezone.utc).isoformat()} ===')

    # ÃƒÂ­Ã…Â Ã‚Â¸ÃƒÂ«Ã…Â¾Ã¢â€žÂ¢ 1: ÃƒÂ¬Ã‚Â¹Ã‚Â´ÃƒÂ­Ã¢â‚¬Â¦Ã…â€™ÃƒÂªÃ‚Â³Ã‚Â ÃƒÂ«Ã‚Â¦Ã‚Â¬ ÃƒÂ¬Ã‹â€ Ã‹Å“ÃƒÂ¬Ã‚Â§Ã¢â‚¬Ëœ (4ÃƒÂªÃ‚ÂµÃ‚Â­ÃƒÂªÃ‚Â°Ã¢â€šÂ¬)
    print(f'--- ÃƒÂ­Ã…Â Ã‚Â¸ÃƒÂ«Ã…Â¾Ã¢â€žÂ¢ 1: ÃƒÂ¬Ã‚Â¹Ã‚Â´ÃƒÂ­Ã¢â‚¬Â¦Ã…â€™ÃƒÂªÃ‚Â³Ã‚Â ÃƒÂ«Ã‚Â¦Ã‚Â¬ ÃƒÂ¬Ã‹â€ Ã‹Å“ÃƒÂ¬Ã‚Â§Ã¢â‚¬Ëœ ({len(COUNTRIES)}ÃƒÂªÃ‚ÂµÃ‚Â­ÃƒÂªÃ‚Â°Ã¢â€šÂ¬) ---')
    for country in COUNTRIES:
        print(f'  [{country}]')
        for name, cid in CATEGORIES.items():
            try:
                items = fetch_category(cid, country)
                for i in items:
                    all_items.append((i, name, country, False, None))
                print(f'    {name}: {len(items)}ÃƒÂªÃ‚Â±Ã‚Â´')
            except Exception as e:
                fails.append(f'category:{country}/{name} ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ {mask_secrets(e)}')
                print(f'    [FAIL] {name}: {mask_secrets(e)}')

    # ÃƒÂ­Ã…Â Ã‚Â¸ÃƒÂ«Ã…Â¾Ã¢â€žÂ¢ 2: ÃƒÂ¬Ã‚Â°Ã‚Â¸ÃƒÂªÃ‚Â³Ã‚Â  ÃƒÂ¬Ã‚Â±Ã¢â‚¬Å¾ÃƒÂ«Ã¢â‚¬Å¾Ã‚Â ÃƒÂ¬Ã‹â€ Ã‹Å“ÃƒÂ¬Ã‚Â§Ã¢â‚¬Ëœ (ÃƒÂªÃ‚ÂµÃ‚Â­ÃƒÂªÃ‚Â°Ã¢â€šÂ¬ ÃƒÂ«Ã‚Â¬Ã‚Â´ÃƒÂªÃ‚Â´Ã¢â€šÂ¬, 1ÃƒÂ«Ã‚Â²Ã‹â€ ÃƒÂ«Ã‚Â§Ã…â€™ ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ 'KR' ÃƒÂ­Ã†â€™Ã…â€œÃƒÂªÃ‚Â·Ã‚Â¸ ÃƒÂ¬Ã…â€œÃ‚Â ÃƒÂ¬Ã‚Â§Ã¢â€šÂ¬)
    print('--- ÃƒÂ­Ã…Â Ã‚Â¸ÃƒÂ«Ã…Â¾Ã¢â€žÂ¢ 2: ÃƒÂ¬Ã‚Â°Ã‚Â¸ÃƒÂªÃ‚Â³Ã‚Â  ÃƒÂ¬Ã‚Â±Ã¢â‚¬Å¾ÃƒÂ«Ã¢â‚¬Å¾Ã‚Â ÃƒÂ¬Ã‹â€ Ã‹Å“ÃƒÂ¬Ã‚Â§Ã¢â‚¬Ëœ ---')
    for ch in REFERENCE_CHANNELS:
        try:
            items = fetch_channel_recent(ch['id'])
            for i in items:
                all_items.append((i, 'reference', 'KR', True, ch['style_tag']))
            print(f'  {ch["name"]}: {len(items)}ÃƒÂªÃ‚Â±Ã‚Â´')
        except Exception as e:
            fails.append(f'channel:{ch["name"]} ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ {mask_secrets(e)}')
            print(f'  [FAIL] {ch["name"]}: {mask_secrets(e)}')

    # ÃƒÂ¬Ã‚Â±Ã¢â‚¬Å¾ÃƒÂ«Ã¢â‚¬Å¾Ã‚Â ÃƒÂ¬Ã†â€™Ã‚ÂÃƒÂ¬Ã¢â‚¬Å¾Ã‚Â¸ ÃƒÂ¬Ã‚ÂÃ‚Â¼ÃƒÂªÃ‚Â´Ã¢â‚¬Å¾ ÃƒÂ¬Ã‚Â¡Ã‚Â°ÃƒÂ­Ã…Â¡Ã…â€™ (subscriber + avatar)
    unique_ch_ids = list({
        i.get('snippet', {}).get('channelId')
        for (i, _, _, _, _) in all_items
        if i.get('snippet', {}).get('channelId')
    })
    print(f'--- ÃƒÂ¬Ã‚Â±Ã¢â‚¬Å¾ÃƒÂ«Ã¢â‚¬Å¾Ã‚Â ÃƒÂ¬Ã†â€™Ã‚ÂÃƒÂ¬Ã¢â‚¬Å¾Ã‚Â¸ ÃƒÂ¬Ã‚Â¡Ã‚Â°ÃƒÂ­Ã…Â¡Ã…â€™: {len(unique_ch_ids)}ÃƒÂªÃ‚Â°Ã…â€œ ÃƒÂ¬Ã‚Â±Ã¢â‚¬Å¾ÃƒÂ«Ã¢â‚¬Å¾Ã‚Â ---')
    ch_details = fetch_channel_details(unique_ch_ids)
    print(f'  ÃƒÂ¬Ã‚ÂÃ¢â‚¬ËœÃƒÂ«Ã¢â‚¬Â¹Ã‚Âµ: {len(ch_details)}ÃƒÂªÃ‚Â°Ã…â€œ')

    # ÃƒÂ«Ã‚Â Ã‹â€ ÃƒÂ¬Ã‚Â½Ã¢â‚¬ÂÃƒÂ«Ã¢â‚¬Å“Ã…â€œ ÃƒÂ«Ã‚Â³Ã¢â€šÂ¬ÃƒÂ­Ã¢â€žÂ¢Ã‹Å“ + ÃƒÂ¬Ã‚Â Ã¢â€šÂ¬ÃƒÂ¬Ã…Â¾Ã‚Â¥
    recs = [to_record(i, cat, country, ref, style, ch_details)
            for (i, cat, country, ref, style) in all_items]
    total = save(sb, recs)

    print(f'\n=== ÃƒÂ¬Ã¢â€žÂ¢Ã¢â‚¬Å¾ÃƒÂ«Ã‚Â£Ã…â€™: {total}ÃƒÂªÃ‚Â±Ã‚Â´ ÃƒÂ¬Ã‚Â Ã¢â€šÂ¬ÃƒÂ¬Ã…Â¾Ã‚Â¥ / ÃƒÂ¬Ã¢â‚¬Â¹Ã‚Â¤ÃƒÂ­Ã…â€™Ã‚Â¨: {len(fails)} ===')
    for f in fails:
        print(f'  {f}')

    migrate_to_archive(sb)


if __name__ == '__main__':
    main()





