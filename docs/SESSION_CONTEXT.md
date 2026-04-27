# ViralBoard 작업 컨텍스트

## 마지막 작업 일시
2026-04-27 (2번째 세션)

## 마지막 커밋
`(이번 세션 커밋 예정)` — feat: issues #1 #2 #3 #4A #4C #6 #7 batch

## 최근 커밋 히스토리
```
(이번 커밋)  feat: #1/#2/#3/#4A/#4C/#6/#7 batch
8424447      feat(scripts): add verify-deploy.js
cd34382      fix(channel-detail): dedup recent videos by video_id
45859dd      feat: issues 7-11 — channel page rewrite + rank snapshots + ad layout + superchat + country fix
55684b7      fix: 7 UI issues — SPA routing, KR picker, Shorts ranks, search loading, revenue label, Shorts shuffle, tab styling
```

## 배포 상태
- **Production URL**: https://viralboard-v2.vercel.app
- **배포 방법**: `vercel --prod` (GitHub 자동 연동 미작동 — 수동 배포 필요)
- **검증**: `npm run verify` (5페이지 headless smoke test)

## 스택
- Vite + React 19 + TypeScript + Tailwind CSS
- Supabase (PostgreSQL) — `viralboard_data` 테이블 (메인)
- Vercel 배포
- Python `backend/scripts/fetch_phase1.py` — 매일 자동 실행

## DB 현황 (2026-04-27 기준)
- `viralboard_data` 총 4254행
- 국가별: KR 897, US 501, JP 374, BR 140, ID 139 …
- 마지막 수집: 2026-04-27 08:14 UTC

## 이번 세션 완료 작업

- [x] **#1 Bug**: 채널 검색 결과 구독자 DESC 정렬 — edge function에서 `.sort(b.subscriber_count - a.subscriber_count)` 추가
- [x] **#2 Feature**: 키워드 영상 검색 페이지 `/search?type=keyword` — 30개 키워드 + 다국어 매핑 (`src/lib/keyword-translations.json`), 바이럴/조회수/좋아요 3-sort
- [x] **#3 Data**: `.github/workflows/daily-fetch.yml` GitHub Actions cron (UTC 08:00 매일) 생성
- [x] **#4-A UI**: ShortsCard overlay 재디자인 — views 15px bold, 날짜 캘린더 아이콘 추가
- [x] **#4-C Algorithm**: 떡상 영상 임계값 완화 (×5 이상, 90일), 24개 pool에서 랜덤 8개, sessionStorage 30분 캐시, 페이지당 8개
- [x] **#6 Bug**: localStorage 목 채널 IDs (sc1~sc5) 자동 청소 — `useSavedChannels.ts`의 `MOCK_IDS` 필터
- [x] **#7 Enhancement**: 인기채널 카드에 구독자 증가 델타 표시 (`+1.2M` / `−50K` 30일 기준)

## 이전 세션 완료 항목 (참고)
- [x] Issue 7~11 (채널 상세 Supabase 연결, 순위 스냅샷, 광고 레이아웃, 슈퍼챗, 국가 수정)
- [x] Recent Videos dedup
- [x] verify-deploy.js 생성

---

## 핵심 파일 경로
```
src/pages/home/page.tsx                        ← 홈 (인기채널, 트렌딩, Shorts, 떡상 영상)
src/pages/home/components/
  SearchBanner.tsx                             ← 검색 배너 (채널 검색 + 키워드 chip)
  AdBillboard.tsx                              ← 광고 컴포넌트
src/pages/search/page.tsx                      ← 검색 페이지 (채널 + 키워드 영상 모드)
src/lib/keyword-translations.json             ← 키워드 다국어 매핑 (30개 키워드)
src/pages/channel-detail/page.tsx             ← 채널 상세
src/hooks/useSavedChannels.ts                  ← 저장 채널 훅 (목 ID 자동 청소)
src/services/youtube.ts                        ← YouTube/Supabase 서비스 (PopularChannelItem + subsDelta)
supabase/functions/search-channel/index.ts     ← YouTube API 채널 검색 Edge Function
.github/workflows/daily-fetch.yml             ← GitHub Actions 일일 수집 (신규)
backend/scripts/fetch_phase1.py               ← Python 수집 → Supabase upsert
scripts/
  verify-deploy.js                             ← 배포 검증 (headless 5페이지)
```

## 주의사항
- `.env` 절대 읽기/출력 금지
- `vercel --prod` 수동 실행 필요 (GitHub 연동 없음)
- anon key는 1000행 제한 → 전체 국가 분포 확인 시 service key 사용
- `package.json` `"type": "module"` → 스크립트는 ESM import 문법 사용
- GitHub Actions secrets 필요: `YOUTUBE_API_KEY_1~3`, `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

## 다음 세션 후보 작업
- Supabase Edge Function 재배포 (`supabase functions deploy search-channel`)
- GitHub Actions secrets 등록 (Repository → Settings → Secrets)
- 주언규 채널 ID를 `REFERENCE_CHANNELS`에 추가 (채널 ID 확인 필요)
- 키워드 번역 JSON 30→50개로 확장
- 채널 랭킹 페이지에도 성장 델타 추가
