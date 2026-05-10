---
date: 2026-05-10
type: master-plan
version: v1.1 (Gemini Adversarial Review 패치 1건 — cycle4 개발/출시 분리)
status: draft (David 최종 컨펌 대기)
audited_against: docs/audit/2026-05-10-cycle1-verification.md
references:
  - docs/audit/master-tracker.md
  - docs/AI_STUDIO_SPEC.md (마스터 위치: c:/Ai_Wiki/docs/)
  - docs/BUSINESS_MODEL.md (마스터 위치: c:/Ai_Wiki/docs/)
  - docs/PROJECT_STATUS_2026-05-05.md
  - .claude/learnings/rejected-patterns.md (#001~#014)
update_policy: 매 cycle 종료 시 cycle 분배 표 + Gate 진행도 업데이트 의무
---

# ViralBoard MASTER_PLAN v1

> **목적**: cycle별 즉석 plan 반복 = 함정. 17일 헛삽질 + cycle1 7시간의 진짜 원인은 마스터 기획서 부재. 본 문서가 모든 cycle의 진북.

---

## 1. ViralBoard 정체성

**한 줄**: YouTube 떡상 영상 자동 분석 + AI 영상 자동 생성 SaaS

**부연 (사실 기반)**:
- 트렌드 발견 → 자기 콘텐츠 적용 → 다국어 글로벌 진출 (AI_STUDIO_SPEC.md)
- 차별점: `viral_ratio = views/subscribers` 배수 메트릭으로 작은 채널 viral hit 탐지
- 통합 경쟁자: OpusClip(제작) + Vrew(편집) + PlayBoard(분석) → 우리는 셋 다

---

## 2. 사용자 5/9 분노 5개 = 영구 추적표

본 표는 **`docs/audit/master-tracker.md` 단일 진실**. 매 cycle 종료 시 audit 결과 반영 의무 (rejected-pattern #014 검증 항목).

### 현재 상태 (cycle1 종료, 2026-05-10)

| P# | 분노 | 진행도 | 잔여 사유 |
|---|---|---|---|
| P1 | 자동 루프 (영상 안 바뀜) | ✅ 80% | 다음 cron 검증 + Niche `-1073741510` 진단 미완 |
| P2 | 데이터 양 부족 (10일 3000개 미만) | ⚠️ 50% | Niche/CPM 부활 + cron 빈도 정상화 필요 |
| P3 | UI 메타/화질/댓글 | ✅ 90% | 댓글 backend proxy 미구현 (헌법 #002, #003 의도적 보류) |
| P4 | 홈 신선도 | ✅ 95% | "급상승 채널 1개" = P2 의존 |
| P5 | 탭 중복 | ⚠️ 20% | 안 C 라벨 정리 미진행 (45분 작업) |

### 종결 조건
각 분노 100% 도달 + 사용자 시각 점검 통과 + 30 세션 재발 없음 시 `최종 종결` 컬럼에 기록.

---

## 3. Gate 1~4 트리거 로드맵

### Gate 1 — Public Beta (회원 0 → 100명)
- **현재 상태**: 진행 중 (출시 차단선 3개 미해결로 발사 보류)
- **도달 조건**:
  - ✅ 분노 P1, P3, P4 신선도 회복 (cycle1 90%+)
  - ❌ Supabase Auth 연동
  - ❌ YouTube API key revoke (의심 노출 키 정리)
  - ❌ Vercel 배포
  - ⚠️ 분노 P2 50%+ (데이터 양 신뢰도)
- **자원**: cycle3 전부 + cycle2 잔여
- **다음 단계**: Product Hunt / Reddit / X 런칭, 분석 트래킹

### Gate 2 — AI Studio 출시 (회원 100 → 1000명)
- **트리거**: 회원 100명 도달 시 AI Studio **봉인 해제 (출시)** — 개발 자체는 cycle4부터 병행
- **개발 vs 출시 분리** (Gemini Adversarial Review v1 패치):
  - **개발 시작**: cycle3 직후 cycle4 진입 (Gate 1 발사 후 즉시 병행)
  - **출시(공개)**: 회원 100명 도달 시점 (개발이 그 전에 끝났든 아니든 봉인 해제)
- **출시 도달 조건**:
  - Gate 1 안정 운영 1주
  - AI Studio Electron 앱 MVP 완성 (B안 풀기능, 3개월 — AI_STUDIO_SPEC.md)
  - CREATOR/GLOBAL 가격 출시 (BUSINESS_MODEL.md)
  - 첫 1000명 평생 30% 얼리버드
- **자원**: cycle4 ~ cycle10
- **다음 단계**: Vrew 사용자 마이그레이션 캠페인

### Gate 3 — Pro 수익화 (회원 1000 → 10000명) — TBD David 정의
- **추정 도달 조건**: B2B 영업 시작 + 다국어 더빙 (6개월 로드맵)
- **확정 필요**: 매출 KPI / Pro tier 기능 정의
- **자원**: TBD

### Gate 4 — Scale (회원 10000 → 100000명) — TBD David 정의
- **추정 도달 조건**: 글로벌 확장 (12-24개월) + Series A 자본
- **확정 필요**: 시장 / 자본 / 팀 규모

---

## 4. cycle별 작업 분배 (현재 상태 기반)

### cycle1 — ✅ 완료 60% (분노 5개 부분 박멸)
- 종결: 2026-05-10
- 결과: P1 80%, P2 50%, P3 90%, P4 95%, P5 20%
- audit: `docs/audit/2026-05-10-cycle1-verification.md`
- PR: https://github.com/tcrowndd1-art/viralboaard/pull/1

### cycle2 — 잔여 P2, P5 + 0905-2차 백로그

**진입 조건**: cycle1 PR merge + master-tracker 인용 frontmatter

**G0** (Phase 0 의무): 직전 audit 인용 + master-tracker 진행도 갱신
**G1.5** P2 핵심: Niche/CPM 부활 진단 + Windows TS cron 정상화 (Fetcher 30분 → 6시간 검토)
**G2** P5 안 C: 메뉴명/라벨 정리 (45분, 6 sub-task — G5 plan 인용)
**G3** 댓글 backend proxy: Supabase Edge Function (60-90분)
**G4** 0905-2차 잔여:
  - submodule .gitmodules / Node.js 20 deprecation
  - max-w-7xl home wrapper
  - type 에러 3건 (creator-insights × 2, home Education)
  - Creator Insights 건강 5건 (5/8 issue-investigation)
  - Fresh SECONDARY 별도 cron 부활 검토
  - PlayBoard 식 풀 크롤 외부 조사 (Gemini Scout)
**G5** audit + master-tracker 갱신

### cycle3 — 출시 차단선 3개 (Gate 1 발사 직전)

**G1** Supabase Auth 연동 (회원가입/로그인 페이지 + RLS)
**G2** YouTube API key revoke + 새 키 발급 + secrets 교체
**G3** Vercel 배포 + 도메인 연결 + 환경변수 설정
**G4** 분석 트래킹 심기 (Posthog 또는 Supabase analytics)
**G5** audit + Gate 1 발사 결정

### cycle4 — AI Studio 개발 시작 (cycle3 직후 즉시 병행)

**진입 조건**: cycle3 출시 차단선 3개 ✅ 후 즉시 진입 (회원 100명 대기 ❌)
**출시 조건**: cycle4~cycle10 누적 결과물 = AI Studio MVP, **회원 100명 도달 시 봉인 해제(Gate 2 출시)**
**G1** Electron 앱 스캐폴드 (Next.js 래핑)
**G2** 8단계 파이프라인 1-3 (다운로드 큐 + 도마 + 자동 컷)
**G3** 4-5 (수동 조정 + SEO)
**G4** 6-8 (자막/더빙 + 배치 렌더링 + 업로드 준비)
**G5** audit + MVP 출시

### cycle5+ — TBD (cycle4 audit 후 결정)

---

## 5. 출시 차단선 (Launch Blocker)

**3개 모두 해결 전 Public Beta 발사 ❌**

| # | 차단선 | 위치 | 작업량 |
|---|---|---|---|
| 1 | Supabase Auth 연동 | 신규 | cycle3 G1 (180분 추정) |
| 2 | YouTube API key 노출 의심 키 revoke + 교체 | Console + .env + secrets | cycle3 G2 (60분) |
| 3 | Vercel 배포 + 도메인 + 환경변수 | Vercel + DNS | cycle3 G3 (120분) |

**검증**: cycle3 audit에서 3개 모두 ✅ 확인 후 Gate 1 발사 결정.

---

## 6. 아키텍처

### 스택 (사실 기반)
- **Frontend**: Vite + React 19 + TypeScript + Tailwind + i18next
- **Backend Data**: Supabase (project icbomjwcateeyjgoujjq) — 영상 데이터 + Auth (cycle3 후) + Edge Function (댓글 proxy)
- **Fetcher**: Python 3.13 + requests + supabase-py (Windows Task Scheduler)
- **Cron 트랙**:
  - Windows TS Fetcher (30분, mostPopular)
  - Windows TS Fresh (1시간, search.list 24h)
  - Windows TS Niche/CPM (일 1회, 현재 죽음)
  - Windows TS TitleArchive (일 1회)
  - GitHub Actions daily-fetch (KST 17시, fetch_phase1.py 1회)
- **Quota 한도**: 7키 × 10K = **70K unit/day** (G2.6 후 사용 ~14.4K = 21%, 안전)

### 데이터 source 매핑
- `viralboard_data` — mostPopular + reference 채널 + fresh_track 통합
- `viralboard_history` — 시계열 스냅샷 (delta 계산용)
- `viralboard_rising` (view) — `data + history` 조인, `views_per_hour`, 7일 윈도우
- `viral_title_archive` — viral_ratio≥20 영상 (Creator Insights 자료)

### 운영 페이지 (12개 — David 정의 필요, 현재 src/pages/ 20+개 존재)
**확인됨**: home / rising / creator-insights / rankings / channel-detail / search / login / signup / dashboard / video-rankings / trending-live / revenue-calculator
**TBD**: ai-studio / chrome-extension / comment-manager / insights / video-editor / DataTab / StudioTab / NotFound — 어느 게 운영 12개에 포함?

### 카테고리 (36개 — David 정의 필요)
**현재 코드 기준**:
- `fetch_phase1.py CATEGORIES` 14개 (people_blogs, entertainment, news_politics, ...)
- `home/page.tsx CAT_LABELS` 9개 (UI 표시: All, Entertainment, Gaming, Music, Sports, Science, Psychology, Self-Dev, Other)
- 5/5 PROJECT_STATUS: "카테고리 15개 세분화"
- 36개 출처 불명 → David 정의 필요

### 3국가 (PRIORITY)
KR / US / BR (fetch_phase1.py:67, G2.6 후 fresh 매시간 유지)

### Mini-PlayBoard 청사진 (Gemini GP3) — TBD David 정의
- "GP3" 의미 불명 (Gemini Pro 3? 코드네임?)
- Mini-PlayBoard = PlayBoard 식 풀 크롤 데이터 분석 페이지 추정
- cycle4+에서 별도 설계

---

## 7. 헌법 (CLAUDE.md + rejected-patterns)

### 현재 등재 (#001 ~ #014)

| # | 패턴 | 레벨 | 등재일 |
|---|---|---|---|
| #001 | Silent Error Swallowing | STANDARD | 2026-04-22 |
| #002 | VITE_KEY frontend 노출 | BLOCKED | 2026-04-22 |
| #003 | 프론트 외부 API 직접 호출 | BLOCKED | 2026-04-22 |
| #006 | git 토큰 노출 | BLOCKED | 2026-04-22 |
| #007 | VITE_ 접두사 오용 | BLOCKED | 2026-04-22 |
| **#008** | AI raw 출력 요청 (키 노출) | **CRITICAL** | 2026-04-22 |
| #009 | CLI dry-run 미실시 | STANDARD | 2026-05-07 |
| #012 | 보호 디렉터리 무단 쓰기 | BLOCKED | 2026-05-08 |
| **#013** | 자기 보고 자기 검증 | BLOCKED | 2026-05-10 |
| **#014** | audit 미참조 plan 작성 | BLOCKED | 2026-05-10 |

### 등재/졸업 의무
- 매 cycle audit 보고서에 **"헌법 등재 후보 패턴"** 섹션 (5회+ 반복 = 등재 후보)
- 30 세션 재발 없음 시 STANDARD → 졸업
- CRITICAL은 영구

---

## 8. 매 cycle 시작 체크리스트

**의무 (#014 검증)**:

```
[ ] 1. docs/audit/master-tracker.md 읽기 → 분노 5개 진행도 확인
[ ] 2. 직전 docs/audit/YYYY-MM-DD-cycle[N-1]-*.md 읽기 → 잔여 항목 인용
[ ] 3. MASTER_PLAN_V1.md Gate 위치 확인 → 현재 cycle 챕터 4 인용
[ ] 4. cycle plan 작성 (frontmatter `audited_against:` 의무)
[ ] 5. cycle G0 자동 시작 (Phase 0 = audit 인용 + master-tracker 갱신 예약)
```

**검증**:
- cycle plan frontmatter에 `audited_against: docs/audit/...` 누락 = #014 위반
- master-tracker.md 미갱신 종료 = #014 위반

---

## 9. 매 cycle 종료 체크리스트

```
[ ] 1. Gemini Adversarial Review (#013 준수, 작업 AI ≠ 검증 AI)
[ ] 2. docs/audit/YYYY-MM-DD-cycle[N]-*.md 보고서 (AUDIT_TEMPLATE.md 사용)
[ ] 3. master-tracker.md 진행도 컬럼 갱신
[ ] 4. 본 MASTER_PLAN_V1.md 챕터 4 cycle[N] 결과 + cycle[N+1] 작업 분배 갱신
[ ] 5. 헌법 등재 후보 패턴 검토 (audit 7장)
[ ] 6. PR 생성 + David Merge 결정
```

---

## 10. 변경 이력

- 2026-05-10 v1: cycle1 종료 후 초기 작성 (Claude Opus 4.7 작성)
- 2026-05-10 v1.1: Gemini Adversarial Review 패치 — cycle4 개발(cycle3 직후) vs 출시(100명 트리거) 분리. 다른 챕터 ✅ APPROVED.

---

## 11. TBD (David 정의 필요)

다음 항목은 David 컨펌 후 cycle별 plan에서 확정:

1. **Gate 3 / Gate 4 도달 조건** (회원 1000/10000 도달 시 KPI/기능)
2. **운영 페이지 12개 정확한 목록** (현재 src/pages/ 20+개)
3. **카테고리 36개 출처/구조** (현재 코드 기준 9~15개)
4. **Mini-PlayBoard 청사진 / Gemini GP3 정의**
5. **출시 차단선 #2 — 의심 키 정확 식별** (cycle1 G0 검증에서 7키 모두 200 OK였음. 정말 노출 키 있나? 5/8 보고서 추정 정확성 재검증)

---

**End of MASTER_PLAN_V1**. 다음 단계: David 컨펌 → Gemini Adversarial Review → cycle2 진입.
