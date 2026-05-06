# ViralBoard Project Context

## Stack
- Vite + React 18 + TypeScript
- react-router-dom (Pages Router 아님)
- Tailwind CSS + i18next (다국어)
- Supabase 직결 (백엔드 서버 없음)

## Paths
- 루트: C:\Ai_Wiki\viralboard
- 라우터: src/router/config.tsx (routes 배열에 추가)
- 페이지: src/pages/[name]/page.tsx
- 서비스: src/services/{supabase,youtube,cache,quotaGuard,openrouter}.ts
- 사이드바: src/components/feature/GlobalSidebar.tsx
- 모달: src/components/VideoModal.tsx
- Python: backend/scripts/{fetch_phase1,fetch_viral_titles,fetch_cpm_channels,fetch_niche_channels}.py
- 환경변수: .env (루트), VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / SUPABASE_SERVICE_KEY / YOUTUBE_API_KEY_1~9

## Supabase
- Project: icbomjwcateeyjgoujjq
- Client (프론트): `import { supabase } from '@/services/supabase'`

### Tables
| 이름 | 타입 | 용도 |
|------|------|------|
| viralboard_data | TABLE | 현재 영상 (7,658건) - upsert (video_id, country) |
| viralboard_history | TABLE | 시간별 스냅샷 (insert만) |
| viralboard_rising | VIEW | 급상승 (data + history JOIN, views_per_hour 계산) |
| viral_title_archive | TABLE | 아카이브 (1,178건) |
| viralboard_hot_shorts_30d / 7d | VIEW | Shorts 핫 |
| viralboard_hot_longform_30d / 3m / 1y | VIEW | 롱폼 핫 |
| category_heat | TABLE/VIEW | 카테고리 트렌드 |
| viralboard_channels / cpm_channels | TABLE | 채널 정보 |

### viralboard_data 컬럼
id, video_id, category, country, title, channel, channel_id, views, likes, comments, duration_seconds, is_shorts, published_at, tags, thumbnail_url, fetched_at, reference_channel, style_tag, subscriber_count, channel_thumbnail_url, niche, estimated_cpm, viral_ratio

### viralboard_rising 컬럼
video_id, title, channel, category, country, is_shorts, current_views, previous_views, view_delta, hours_diff, views_per_hour, thumbnail_url, fetched_at

## Cron
- fetch_phase1.py: 15분마다 (절대 끄지 말 것 - 사용자 강조)
- fetch_viral_titles.py: 매일 04:00 KST
- API 키 7개 라운드로빈 (next_key 함수)

## 우선순위 국가
**KR > US > BR** (3대장) - 모든 신규 기능 이 순서로

## YouTube 카테고리 ID
1=film, 2=autos, 10=music, 15=pets, 17=sports, 20=gaming,
22=people, 23=comedy, 24=entertainment, 25=news, 26=howto, 28=tech, 29=nonprofits
※ 18(short_movies), 19(travel), 27(education), 43/44(shows/trailers) → mostPopular 미지원

## 작업 규칙
1. 새 페이지 → src/pages/[name]/page.tsx + config.tsx routes 등록
2. 사이드바 메뉴 → GlobalSidebar.tsx labelKey 추가
3. 다국어 → src/i18n 키 추가
4. 영상 클릭 → VideoModal 컴포넌트 사용
5. Supabase 쿼리는 services/supabase.ts의 supabase 클라이언트 사용
6. 모든 새 코드는 KR/US/BR 우선순위로 정렬

## 절대 규칙 (인코딩 안전)

### ❌ 금지
- PowerShell `Set-Content` (BOM 붙음)
- PowerShell `[System.IO.File]::WriteAllText` + here-string에 한글
- PowerShell `-replace` 정규식에 한글/유니코드

### ✅ 필수
- 한글/유니코드 포함 파일 작업 = Python으로만
- 파일 전체 새로 쓸 때 = Python `open(path, 'w', encoding='utf-8', newline='\n')`
- 부분 수정 = Python으로 read → modify → write

### 작업 후 검증 필수
1. 파일 저장 후 → 브라우저 새로고침 → 스크린샷
2. 깨짐 확인되면 즉시 롤백, 다음 작업 X

## 데일리 인계 규칙
- 작업 종료 시 docs/daily/DAILY-YYYY-MM-DD.md 작성
- 새 세션 시작 시 가장 최근 DAILY 1개만 첨부 (다른 파일 첨부 금지)
- 자동 생성: powershell ./scripts/daily-handoff.ps1