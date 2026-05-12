---
date: 2026-05-11
type: adversarial-review
target: docs/analysis/2026-05-11-tab-unification-analysis.md
reviewer: Claude Code (동일 AI — #013 구조적 주의 아래)
audited_against: docs/audit/2026-05-10-cycle1-verification.md
status: APPROVED-with-patches
verdict: ⚠️ APPROVED with patches (5개 패치 필수)
---

# Adversarial Review — 4탭 통합 분석 기획서

> #013 구조적 주의: 이 리뷰는 분석 문서를 작성한 동일 AI(Claude Code)가 수행함.
> 완전한 독립성 없음 → 판정 신뢰도에 이 한계를 적용할 것.
> David 명시 지시이므로 진행, 단 한계 명시 의무.

---

## 0. 종합 판정

**⚠️ APPROVED with patches**

- 코드 기반 사실(limit 수치, 테이블명, 쿼리 조건)은 대부분 grep 검증 통과
- 그러나 필수 패치 5개 미해결 시 구현 진입 ❌

---

## 1. 챕터 1 검증 — 4탭 정밀 분해

### 통과 항목 (grep 검증)

| 주장 | 검증 | 판정 |
|------|------|------|
| Effect A: limit(200) | home/page.tsx:697 `.limit(200)` | ✅ |
| Effect B: limit(50) | home/page.tsx:744 `.limit(50)` | ✅ |
| Effect C: limit(1000) | home/page.tsx:803 `.limit(1000)` | ✅ |
| Rising effect: limit(200) | home/page.tsx:874 `.limit(200)` | ✅ |
| catPool: limit(100) | home/page.tsx:970 `.limit(100)` | ✅ |
| rising/page.tsx: limit(100) | rising/page.tsx:99 `.limit(100)` | ✅ |
| creator-insights: viral_title_archive | page.tsx:`.from('viral_title_archive')` | ✅ |
| viralboard_rising fallback: viralboard_data | rising/page.tsx:112-147 | ✅ |
| Rising 조건: subscriber_count > 0, views/subs >= 100 | home/page.tsx:878-880 | ✅ |
| Rising 조건: !is_shorts | home/page.tsx:881 | ✅ |
| Rising 조건: published_at 7일 | home/page.tsx:883 `_publishCutoff` | ✅ |

### ❌ 오류 발견 — perPage 수치

- **주장** (분석 문서 line 40): `"표시: 8개 (perPage=8)"`
- **실제** (home/page.tsx:907): `.slice(0, 12)` → **12개**
- **증거**: `grep slice(0, 12) src/pages/home/page.tsx` → line 907 확인
- **패치 필요**: "8개 (perPage=8)" → "12개 (slice 0~12)"

### ⚠️ 의심 — "Shorts: 90일+30일" 표기

- "90일+30일" 표현이 불명확 (두 쿼리의 합인지, 하나의 조건인지)
- 실측 불완료 (timebox 제약)
- 구현 전 home/page.tsx Shorts Effect 날짜 조건 재확인 필요

---

## 2. 챕터 2 검증 — 사용자 의도 매핑

### ❌ CRITICAL — P1~P5 라벨 충돌 (#014 위반)

**문제**:
- `master-tracker.md` P1~P5 = David 5/9 분노 5개:
  - P1 = 자동루프 (영상 안 바뀜)
  - P2 = 데이터양 부족
  - P3 = UI 메타/화질/댓글
  - P4 = 홈 신선도 (218주)
  - P5 = **탭 중복** (떡상↔급상승↔인사이트↔랭킹)

- 분석 문서 Chapter 2 P1~P5 = 가상 사용자 페르소나:
  - P1 = YouTuber 지망생
  - P2 = 중소 채널 운영자
  - P3 = MCN/에이전시
  - P4 = 데이터 분석가
  - P5 = 캐주얼 트렌드 탐색자

**결론**: 동일 레이블(P1~P5)이 두 문서에서 다른 의미로 사용됨 → 혼란 유발.  
`master-tracker.md` 무인용 → #014 위반.

**중요**: 분석 문서의 핵심 과제(P5=탭중복)가 master-tracker 기준 **20% 완료** 상태임을  
Chapter 2에서 전혀 연결하지 않음 → 분노 해소 진행률 맥락 누락.

**패치**: Chapter 2 P1~P5 라벨을 Persona-A~E로 변경 + master-tracker.md P5 진행률(20%) 인용 추가.

---

## 3. 챕터 3 검증 — 중복도 매트릭스

### ⚠️ 의도 중복 vs 데이터 중복 미분리

- 현재 매트릭스 1개: "데이터 소스 중복"
- 의도(UX 목적) 중복 별도 분석 없음
- 예시: 홈 Top Views ↔ 비디오 랭킹은 데이터 소스 HIGH 중복이지만,
  목적은 "한눈에 보기" vs "정렬/필터 분석" → 의도 중복은 MEDIUM
- 리뷰 요구사항 명시 항목 미충족

**패치**: 의도 중복 매트릭스 별도 추가 (데이터 중복 ≠ 목적 중복).

### ❌ 홈 Rising ↔ 랭킹 떡상탐지 설명 구식

- 문서(line 151-153): `"동일 지표: viralScore = views/subscriber_count (둘 다)"`
- **실제 상태 (2026-05-11 수정 후)**:
  - 홈 Rising 정렬: `viewsPerHour(b) - viewsPerHour(a)` (home/page.tsx:906)
  - 랭킹 떡상탐지 정렬: `viralScore DESC` (video-rankings 별도 유지)
  - → 두 섹션의 정렬 기준이 **이미 분화됨**
- 🟠 MED 판정이 → 🟡 LOW로 하향 검토 대상
- **패치**: "둘 다 viralScore" 서술 정정 → "홈은 VPH, 랭킹은 viralScore — 2026-05-11 이미 분화"

---

## 4. 챕터 4 검증 — 작동 여부

- "비디오랭킹 / 크리에이터인사이트 작동 추정" → ⚠️ 정직하게 표시됨 ✅
- "시각 점검 미완료" 주석 존재 ✅

---

## 5. 챕터 5 검증 — 옵션 3개

### 회귀 위험 명시 여부

| 옵션 | 회귀 위험 명시 | 판정 |
|------|--------------|------|
| A (1탭) | "회귀 위험 최고" 명시 | ✅ |
| B (2탭) | URL 변경/SEO 깨짐 명시됨, "회귀 위험" 레이블 없음 | ⚠️ |
| C (3탭) | Chapter 6에 5개 위험 항목 상세표 | ✅ |

### 사용자 영향 정직성

- Option C 단점: "홈이 더 복잡해짐", "/rising 북마크 깨짐", "떡상탐지 중복 유지" — 정직하게 기술됨 ✅
- Option B 단점: URL 변경 → SEO/북마크 깨짐 명시 ✅
- Option A 단점: "3주 이상 예상" + "회귀 위험 최고" ✅

---

## 6. 챕터 7 검증 — 구현 계획

### Phase 시간 추정

| Phase | 문서 추정 | 현실성 평가 |
|-------|----------|-------------|
| Phase 1 (홈 Rising 확장) | 3~4일 | ⚠️ 낙관적 — home/page.tsx 현재 1383줄, 국가탭 11개 + Video/Shorts 토글 + 컴포넌트 분리. 5~7일 현실적 |
| Phase 2 (redirect + NAV 제거) | 1일 | ✅ 현실적 |
| Phase 3 (떡상탐지 차별화) | 2일 (선택적) | ✅ 텍스트 변경만이면 현실적 |

### ❌ 번복 횟수 미명시

- 리뷰 요구사항: "번복 회수 명시했나 (정직)"
- 문서에 번복 시나리오/횟수 항목 없음
- **패치**: Phase 1에 "예상 번복: 국가 필터 state 충돌 시 1~2회 / 카테고리 연동 충돌 시 1회" 추가

### frontmatter `audited_against` 누락

- #014 검증 기준: `audited_against: docs/audit/YYYY-MM-DD-cycleN-...md` frontmatter 필수
- 현재 frontmatter에 해당 필드 없음
- **패치**: frontmatter에 `audited_against: docs/audit/2026-05-10-cycle1-verification.md` 추가

---

## 7. 헌법 준수 검증

| 조항 | 내용 | 판정 |
|------|------|------|
| #013 자기 검증 금지 | 분석 AI = 이 리뷰 AI (동일) | ⚠️ 구조적 위반 — David 명시 지시로 진행, 한계 명시 |
| #014 audited_against | frontmatter 미존재 | ❌ 패치 필요 |
| #014 master-tracker 인용 | Chapter 2 미인용 | ❌ 패치 필요 |
| #008 raw 출력 금지 | 분석 문서에 키/토큰 없음 | ✅ |
| #002 VITE_ 노출 | 없음 | ✅ |
| 코드 수정 ❌ | 분석 문서에 코드 수정 없음 | ✅ |

---

## 8. 필수 패치 목록

| 번호 | 항목 | 위치 | 우선순위 |
|------|------|------|----------|
| **P1** | frontmatter `audited_against` 추가 | 분석 문서 line 1-13 | 🔴 필수 |
| **P2** | P1~P5 라벨 → Persona-A~E로 rename + master-tracker P5(20%) 인용 | Chapter 2 전체 | 🔴 필수 |
| **P3** | perPage "8개" → "12개" 수정 | Chapter 1, 홈 Rising 상세 | 🔴 필수 |
| **P4** | 번복 횟수 추가 | Chapter 7 Phase 1 | 🟠 권장 |
| **P5** | 의도 중복 매트릭스 추가 + 홈Rising↔랭킹 정렬 서술 정정 | Chapter 3 | 🟠 권장 |

---

## 9. 승인 조건

- 🔴 P1~P3 패치 완료 → ✅ APPROVED 승격 가능
- 🟠 P4~P5는 구현 전 완료 권장 (선택)
- Gemini CLI 독립 검증 추가 권장 (#013 구조적 한계 보완)

---

*리뷰어: Claude Code (Sonnet 4.6) | 날짜: 2026-05-11 | timebox: 30분*
