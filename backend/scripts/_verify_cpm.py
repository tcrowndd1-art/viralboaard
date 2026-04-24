import os
from supabase import create_client
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
load_dotenv(env_path)
sb = create_client(os.getenv('VITE_SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))

r = sb.table('viralboard_cpm_channels').select(
    'channel_name,keyword_niche,estimated_cpm,subscriber_count,priority_score'
).order('priority_score', desc=True).limit(10).execute()

print(f'총 CPM 채널: {len(r.data)}건')
print()
print('Priority TOP 10:')
for item in r.data:
    niche  = item.get('keyword_niche') or '?'
    name   = str(item.get('channel_name') or '')[:30]
    cpm    = item.get('estimated_cpm') or 0
    subs   = item.get('subscriber_count') or 0
    score  = item.get('priority_score') or 0
    print(f'  [{niche}] {name:30s} | CPM ${cpm} | subs {subs:,} | score {score:.1f}')
