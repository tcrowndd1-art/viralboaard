import os, requests
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
load_dotenv(env_path)

url  = os.getenv('VITE_SUPABASE_URL') + '/functions/v1/search-channel'
anon = os.getenv('VITE_SUPABASE_ANON_KEY', '').strip()

print(f'URL: {url}')
print(f'ANON key length: {len(anon)} chars, starts: {anon[:12]}...')

headers = {
    'Authorization': f'Bearer {anon}',
    'Content-Type':  'application/json',
    'apikey':        anon,
}

r = requests.post(url, headers=headers, json={'query': 'MrBeast'}, timeout=30)
print(f'Status: {r.status_code}')
print(f'Body: {r.text[:800]}')
