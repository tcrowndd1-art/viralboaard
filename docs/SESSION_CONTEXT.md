# ViralBoard 작업 컨텍스트

## 마지막 작업 일시
2026-04-27 (오늘 세션)

## 마지막 커밋
`8424447` — feat(scripts): add verify-deploy.js — 5-page headless smoke test

## 최근 커밋 히스토리
```
8424447 feat(scripts): add verify-deploy.js
cd34382 fix(channel-detail): dedup recent videos by video_id
45859dd feat: issues 7-11 — channel page rewrite + rank snapshots + ad layout + superchat + country fix
772094d chore: trigger redeploy for vercel.json SPA fallback
55684b7 fix: 7 UI issues — SPA routing, KR picker, Shorts ranks, search loading, revenue label, Shorts shuffle, tab styling
```

## 배포 상태
- **Production URL**: https://viralboard-v2.vercel.app
- **Latest deploy**: https://viralboard-v2-ovkh98668-tcrowndd1-8412s-projects.vercel.app (57분 전, Ready)
- **배포 방법**: `vercel --prod` (GitHub 자동 연동 미작동 — 수동 배포 필요)
- **검증**: `npm run verify` (5페이지 headless smoke test)

## 스택
- Vite + React 19 + TypeScript + Tailwind CSS
- Supabase (PostgreSQL) — `viralboard_data` 테이블 (메인)
- Vercel 배포
- 수집: Python `backend/scripts/fetch_phase1.py` (매일 자동 실행, 24개국, 1297건/일)

## DB 현황 (2026-04-27 기준)
- `viralboard_data` 총 4254행
- 국가별: KR 897, US 501, JP 374, BR 140, ID 139 …
- 마지막 수집: 2026-04-27 08:14 UTC
- `video_snapshots` 테이블 없음 (사용 안 함)

## 완료된 작업 (이번 세션)
- ✅ Issue 7: channel-detail 실제 Supabase 데이터 연결 (mock 제거)
- ✅ Issue 8: 인기채널 순위 등락 — 일별 자정 스냅샷 방식 (▲▼ NEW 뱃지)
- ✅ Issue 9: 광고 히어로→콘텐츠 스트림 이동 (AdBillboard.tsx 분리, AdStrip 추가)
- ✅ Issue 10: 슈퍼챗 "Coming Soon" → 4-metric 섹션 (—)
- ✅ Issue 11: collect.js country 정확도 — VN/ID → KR 잘못 태깅 수정 (언어 추론 추가)
- ✅ Recent Videos 중복 제거 (video_id dedup, limit 60→unique 12)
- ✅ verify-deploy.js 생성 (npm run verify)

---

## 진행 중 항목 (체크리스트)

- [x] **#1** 채널 검색: 동명 채널 전부 노출 (picker grid UI 추가)
- [x] **#2** 키워드 검색 버튼 + 다국가 키워드 매핑 (KR/US/JP/BR/ID/TH/VN/IN/DE/FR/GB)
- [x] **#3** Shorts DB 1993개 확인 (KR 343) — 자동 수집은 backend에서 이미 동작 중
- [x] **#4-A** ShortsCard: 날짜·조회수 이미 표시됨
- [x] **#4-B** VideoModal: 저장(bookmark toggle) + 공유(clipboard) + YouTube 버튼
- [x] **#4-C** 떡상 영상 3개 + 새로고침 버튼(risingSeed 로테이션)
- [x] **#5** MEGA/MACRO/MID/MICRO/NANO 5단계 + 구독자 임계값 tooltip
- [x] **#6** useSavedChannels mock seed 제거 + 구독자순 우선순위 정렬
- [x] **#7** 인기채널 롤링 30일 쿼리 + TOP100 (10개/페이지 네이션) + 카테고리 뱃지

---

## 핵심 파일 경로
```
src/pages/home/page.tsx                        ← 홈 (인기채널, 트렌딩, Shorts)
src/pages/home/components/
  SearchBanner.tsx                             ← 검색 배너 (채널 검색)
  AdBillboard.tsx                              ← 광고 컴포넌트 (이번 세션 신규)
src/pages/channel-detail/page.tsx             ← 채널 상세 (Supabase 연결 완료)
src/pages/channel-detail/components/
  RecentVideos.tsx                             ← 최근 영상 목록
  ViewsBarChart.tsx                            ← 조회수 차트
scripts/
  collect.js                                  ← Node.js 수집 스크립트 (JSON → local)
  verify-deploy.js                             ← 배포 검증 (이번 세션 신규)
  db_check.mjs                                 ← DB 상태 체크 (not committed)
backend/scripts/
  fetch_phase1.py                              ← Python 수집 → Supabase 직접 upsert
  run_fetcher.ps1                              ← 수집 실행 스크립트
```

## 주의사항
- `.env` 절대 읽기/출력 금지
- `vercel --prod` 수동 실행 필요 (GitHub 연동 없음)
- anon key는 1000행 제한 → 전체 국가 분포 확인 시 service key 사용
- `package.json` `"type": "module"` → 스크립트는 ESM import 문법 사용
