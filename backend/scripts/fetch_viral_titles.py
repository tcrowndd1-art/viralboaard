"""
ViralBoard - viral_title_archive 수집
mostPopular API (KR, 13개 카테고리) → viral_ratio >= 20 → upsert
실행: backend/.venv/Scripts/python.exe backend/scripts/fetch_viral_titles.py
"""
import os
import sys
import requests
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(env_path)

API_KEYS = [k for k in [
    os.getenv(f'YOUTUBE_API_KEY_{i}')
    for i in range(1, 10)
] if k]
print(f'[INFO] YouTube API 키 로드: {len(API_KEYS)}개')

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not API_KEYS or not SUPABASE_URL or not SUPABASE_KEY:
    print('[FATAL] 환경변수 누락')
    sys.exit(1)

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

_key_idx = 0
def next_key():
    global _key_idx
    k = API_KEYS[_key_idx % len(API_KEYS)]
    _key_idx += 1
    return k

CATEGORIES = {
    '1':  'film_animation',
    '2':  'autos_vehicles',
    '10': 'music',
    '15': 'pets_animals',
    '17': 'sports',
    '19': 'travel_events',
    '20': 'gaming',
    '22': 'people_blogs',
    '23': 'comedy',
    '24': 'entertainment',
    '25': 'news_politics',
    '26': 'howto_style',
    '28': 'science_tech',
}


def fetch_most_popular(cat_id):
    r = requests.get('https://www.googleapis.com/youtube/v3/videos', params={
        'part': 'snippet,statistics',
        'chart': 'mostPopular',
        'regionCode': 'KR',
        'videoCategoryId': cat_id,
        'maxResults': 50,
        'key': next_key(),
    }, timeout=30)
    r.raise_for_status()
    return r.json().get('items', [])


def fetch_subs(channel_ids):
    result = {}
    for i in range(0, len(channel_ids), 50):
        batch = channel_ids[i:i+50]
        r = requests.get('https://www.googleapis.com/youtube/v3/channels', params={
            'part': 'statistics',
            'id': ','.join(batch),
            'key': next_key(),
        }, timeout=30)
        r.raise_for_status()
        for ch in r.json().get('items', []):
            result[ch['id']] = int(ch.get('statistics', {}).get('subscriberCount', 0) or 0)
    return result


def save_records(records):
    if not records:
        return 0
    try:
        sb.table('viral_title_archive').upsert(
            records, on_conflict='video_id,country'
        ).execute()
        return len(records)
    except Exception as e:
        print(f'  [SAVE ERROR] {str(e)[:200]}')
        return 0


def main():
    total = 0
    now = datetime.now(timezone.utc)
    print(f'=== viral_title_archive mostPopular 수집 {now.strftime("%Y-%m-%d %H:%M")} ===')
    print(f'카테고리: {len(CATEGORIES)}개 / regionCode=KR / viral_ratio>=20\n')

    for cat_id, cat_name in CATEGORIES.items():
        try:
            items = fetch_most_popular(cat_id)
            if not items:
                print(f'[{cat_name}] 결과 없음')
                continue

            ch_ids = list({
                i['snippet']['channelId']
                for i in items
                if i.get('snippet', {}).get('channelId')
            })
            sub_map = fetch_subs(ch_ids)

            records = []
            for item in items:
                s  = item.get('snippet', {})
                st = item.get('statistics', {})
                ch_id = s.get('channelId', '')
                sub   = sub_map.get(ch_id, 0)
                views = int(st.get('viewCount', 0) or 0)

                if sub < 1000:
                    continue

                viral_ratio = round(views / sub, 1) if sub > 0 else None
                if not viral_ratio or viral_ratio < 20:
                    continue

                pub_str   = s.get('publishedAt')
                days_since = None
                if pub_str:
                    try:
                        pub_dt     = datetime.fromisoformat(pub_str.replace('Z', '+00:00'))
                        days_since = (now - pub_dt).days
                    except Exception:
                        pass

                records.append({
                    'video_id':             item['id'],
                    'title':                s.get('title', ''),
                    'channel':              s.get('channelTitle', ''),
                    'channel_id':           ch_id,
                    'category':             cat_name,
                    'country':              'KR',
                    'views':                views,
                    'subscriber_count':     sub,
                    'viral_ratio':          viral_ratio,
                    'published_at':         pub_str,
                    'days_since_published': days_since,
                    'thumbnail_url':        s.get('thumbnails', {}).get('medium', {}).get('url'),
                    'source':               'most_popular',
                })

            n = save_records(records)
            total += n
            print(f'[{cat_name}] {len(items)}개 조회 → viral>=20x {len(records)}개 → 저장 {n}개')

        except Exception as e:
            print(f'[FAIL] {cat_name}: {str(e)[:150]}')

    print(f'\n=== 완료: 총 {total}건 저장 ===')


if __name__ == '__main__':
    main()
