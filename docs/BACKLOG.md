# ViralBoard BACKLOG

> AI 에이전트가 읽는 plain-text 파일. Dataview 쿼리 없음.
> 완료 시 [x] 체크 + status 업데이트. 정렬: 우선순위 내림차순.

---

## 🔴 HIGH — 즉시 필요

- [x] [상] GitHub Secrets 등록 — YOUTUBE_API_KEY_1~7, VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY 모두 .env 보유 + GitHub Actions 등록 사용자 확인됨 (2026-05-07)
- [x] [상] supabase functions deploy search-channel — b841dbd 정렬 수정 반영 (2026-05-07 배포 완료, project icbomjwcateeyjgoujjq)
- [x] [상] Gemini CLI shim 복구 — npm install -g @google/gemini-cli 재실행 (2026-05-07 완료, gemini 0.41.2)

---

## 🟡 MEDIUM — 다음 세션

- [ ] [중] 0905-2차: 급상승 롱폼 수집 강화 — fetch_fresh_track()에 YouTube Search API로 롱폼(videoDuration=long) 24h 신규 영상 별도 수집. 현재 DB는 7일 이내 롱폼 0개(전부 Shorts). ALL 탭 Shorts 포함으로 임시 해결 중. quota 소모 추가 검토 필요. (출처: cycle2 진단 2026-05-12)
- [ ] [중] 0905-2차: fetch_fresh_track subscriber_count 채우기 — fetch_phase1.py fetch_fresh_track()에 fetch_channel_details() 호출 추가. 현재 fresh_track 비디오는 subscriber_count=NULL로 저장됨. (출처: cycle2 진단 2026-05-12)
- [ ] [중] - Topic 채널 필터 — fetch_phase1.py 수집 시 또는 home/page.tsx 표시 시 필터링 (출처: 2026-04-27-pre-phase1-audit)
- [ ] [중] GitHub Actions 알림 — 성공/실패 시 텔레그램 알림 step 추가 (자료 OK: TELEGRAM_BOT_TOKEN/CHAT_ID .env 보유. workflow yaml 추가만 필요) (출처: 2026-04-27-pre-phase1-audit)
- [ ] [중] viralScore DB 저장 — 런타임 계산 대신 수집 시 저장 (쿼리 성능 개선)
- [ ] [중] rate limit 구현 — YouTube API 403 시 key rotation + sleep
- [ ] [중] git remote URL 오타 수정 — viralboaard → viralboard (현재: tcrowndd1-art/viralboaard.git)

---

## 🟢 LOW — 이번 주 내

- [ ] [하] Phase 1.5: 옵시디언 vault 등록 + 플러그인 3개 (Dataview, Daily Notes, Templater)
- [ ] [하] Phase 1.5: .obsidian/workspace* gitignore 확인 + BACKLOG-VIEW.md (Dataview용 별도)
- [ ] [하] docs/daily/ 정리 — DAILY-2026-05-05.md 중복 2개 (DAILY-2026-05-05_2.md) 처리

---

## 📋 PHASE 2+ — 자동화 (설계 완료, 구현 대기)

- [ ] [하] Phase 2: 자동 검수 워크플로우 (.claude/workflows/adversarial-review.md 구현)
- [ ] [하] Phase 2: node 기반 pre-commit hook (ml-48, dark:bg-[# 패턴 차단)
- [ ] [하] Phase 3: insight_generator.py — Supabase 메트릭 자동 추출 → docs/insights/ 저장
- [ ] [하] Phase 3: vidIQ + YouTube Data 통합 인사이트
- [ ] [하] Phase 4: Dataview Publisher → BACKLOG 자동 갱신 (AI + 사람 동시 접근)

---

## ✅ 완료

- [x] Phase 1: .gitignore 업데이트 (2026-05-07)
- [x] Phase 1: docs/analysis/ 폴더 + README + frontmatter 표준 (2026-05-07)
- [x] Phase 1: GEMINI.md 강화 — 쓰기금지 + Adversarial Review 명령 (2026-05-07)
- [x] Phase 1: docs/BACKLOG.md 통합 추적 (2026-05-07)
- [x] Phase 1: .claude/workflows/adversarial-review.md (2026-05-07)
