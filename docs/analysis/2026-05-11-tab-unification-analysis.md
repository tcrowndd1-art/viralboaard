---
type: analysis
priority: P0
status: draft
affected_code:
  - src/pages/home/page.tsx
  - src/pages/video-rankings/page.tsx
  - src/pages/rising/page.tsx
  - src/pages/creator-insights/page.tsx
related_insights: []
author: Claude Code (grep-based, code ❌ 수정)
date: 2026-05-11
audited_against: docs/audit/2026-05-10-cycle1-verification.md
master_plan: docs/plans/MASTER_PLAN_V1.md
master_tracker: docs/audit/master-tracker.md
---

# 4탭 통합 분석 기획서

> 근거: grep + 실제 파일 읽기. 추측 없음.

---

## 1. 현재 4탭 정밀 분해

### 1-A. 홈 (`/` → `src/pages/home/page.tsx`)

| 항목 | 내용 |
|------|------|
| **파일** | `src/pages/home/page.tsx` (1383줄) |
| **섹션 수** | 6개 (Popular Channels / Shorts / Rising Channels / Top Views / Trending Live / Total Views TOP) |
| **데이터 소스** | `viralboard_data` ×3 Effect (A/B/C) + `viralboard_data` catPool 별도 쿼리 |
| **정렬 기준** | Shorts: viewsPerHour() 계산 / Rising: viewsPerHour() 계산 (views/subs 필터 후) / TopViews: views DESC / Trending: VPH 계산 |
| **필터** | CountryPicker (전역, 국가 변경 시 전체 재조회) + 카테고리 pill (All/Entertainment/Gaming/Music/Sports/Science/Psychology/Self-Dev/Other) |
| **자동 갱신** | Shorts 30s / Trending 45s / Rising 60s (pageVisible 기준 정지) |
| **쿼리 limit** | Effect A: 200 / Effect B: 50 / Effect C: 1000 / Rising effect: 200 / catPool: 100 |
| **데이터 윈도우** | Shorts: 90일+30일 / Rising: 30일 / Trending: 7일 / Channels: 30일 |
| **목적** | 종합 대시보드 — 전체 트렌드 한눈에 보기 |

#### 홈 Rising Channels 상세
- `viralboard_data`에서 30일 이내 + `subscriber_count > 0` + `views/subscriber_count >= 100` + `!is_shorts` + 7일 이내 published
- DB `.order('views', ascending: false)` → 클라이언트에서 `viewsPerHour()` 재정렬
- 표시: 12개 (.slice(0, 12)), 셔플 제거됨 (2026-05-11 수정)

---

### 1-B. 비디오 랭킹 (`/video-rankings` → `src/pages/video-rankings/page.tsx`)

| 항목 | 내용 |
|------|------|
| **파일** | `src/pages/video-rankings/page.tsx` (1057줄) |
| **모드** | 2개: `rankings` (인기순위) / `viral` (떡상 탐지) |
| **데이터 소스 — rankings** | `viralboard_data` + `viralboard_history` (전날 스냅샷, 순위변동 계산) |
| **데이터 소스 — viral** | `viralboard_data` 단독 |
| **정렬 — rankings** | views DESC (DB), 클라이언트 재정렬 가능 (rank/views/uploadDate × asc/desc) |
| **정렬 — viral** | viralScore = views/subscriber_count DESC |
| **필터 — rankings** | Country + Period (Daily 1일/Weekly 7일/Monthly 30일) + Category (6개) |
| **필터 — viral** | Country만 |
| **CAT_TO_DB** | 로컬 역매핑 정의 (categoryMap의 DB_CAT_MAP 미사용) |
| **쿼리 limit** | 200 (rankings) / 200 (viral) |
| **UI** | 테이블 + Hover popup (AI 인사이트 — seededRand 모의값) + 북마크 |
| **목적** | 국가/기간별 비디오 정렬 순위 열람 + 떡상 탐지 |

#### 떡상 탐지 모드 상세
- `viralboard_data` `.gt('subscriber_count', 0).order('views', DESC).limit(200)` → `.sort(viralScore DESC).slice(50)`
- 표시: views/subscriber_count 배수 (×N), VPH 계산 (클라이언트, 최대 72h 캡), 종합 점수 (viralNorm×40 + viewsNorm×30 + recencyNorm×30)
- viralMockData fallback 존재 (API 실패 시)

---

### 1-C. 급상승 (`/rising` → `src/pages/rising/page.tsx`)

| 항목 | 내용 |
|------|------|
| **파일** | `src/pages/rising/page.tsx` (279줄) |
| **데이터 소스 (1순위)** | `viralboard_rising` VIEW (views_per_hour DESC, 7일 이내 published) |
| **데이터 소스 (fallback)** | `viralboard_data` (published_at >= 30일, views DESC, limit 300 → 클라이언트 VPH 정렬) |
| **viralboard_rising 정의** | `migrate_rising_view_v2.sql` — history JOIN으로 실시간 델타, 없으면 생애평균 fallback |
| **국가 필터** | 11개 버튼 탭 (ALL/KR/US/BR/JP/IN/GB/DE/FR/ID/MX) |
| **타입 필터** | ALL / Video(is_shorts=false) / Shorts(is_shorts=true) |
| **정렬** | views_per_hour DESC (DB 레벨) |
| **limit** | 100 |
| **UI** | 카드 그리드 4열, 순위 뱃지(1~3), VPH 뱃지, Shorts 뱃지 |
| **목적** | 지금 이 순간 가장 빠르게 조회수 오르는 영상 전문 탭 |

---

### 1-D. 크리에이터 인사이트 (`/creator-insights` → `src/pages/creator-insights/page.tsx`)

| 항목 | 내용 |
|------|------|
| **파일** | `src/pages/creator-insights/page.tsx` (705줄) |
| **데이터 소스** | `viral_title_archive` (**별도 테이블** — viralboard_data 아님) |
| **국가** | KR 고정 (`.eq('country', 'KR')`) — 다국가 필터 없음 |
| **정렬** | viral_ratio DESC (DB) |
| **필터 조건** | `viral_ratio >= 5` |
| **카테고리 시스템** | 한글 라벨 (먹방/예능/게임/과학...) → dbValues 배열 (people_blogs/entertainment/gaming/science_tech) |
| **기간 필터** | days_since_published 기준: 7일/30일/90일 (클라이언트 필터) |
| **채널 크기 필터** | 전체/마이크로(1K~10K)/일반(10K~1M) (클라이언트) |
| **영상 타입** | 전체/가로영상/Shorts (클라이언트) |
| **UI** | 테이블 + 중앙 모달 (YouTube iframe + 댓글) |
| **목적** | KR 크리에이터 제목 패턴 분석, 채널 성장 인사이트 |

---

## 2. 사용자 의도 매핑 (유저 페르소나 × 4탭)

> ⚠️ 이 섹션의 페르소나 ID (U1~U5)는 사용자 유형 분류임.
> David 5/9 분노 추적 ID (P1~P5)는 `docs/audit/master-tracker.md` 참조.

### David 5/9 분노 → 이 분석과의 연결 (master-tracker.md 기준)

| 분노 ID | 내용 | master-tracker 진행률 | 이 분석 관련 |
|--------|------|----------------------|-------------|
| **P1** | 자동루프 (영상 안 바뀜) | ✅ 80% | — (별도 인프라 이슈) |
| **P2** | 데이터양 부족 | ⚠️ 50% | — (수집 빈도 이슈) |
| **P3** | UI 메타/화질/댓글 | ✅ 90% | — (컴포넌트 이슈) |
| **P4** | 홈 신선도 (218주 노출) | ✅ 95% | — (필터 이슈, 수정됨) |
| **P5** | **탭 중복** (떡상↔급상승↔인사이트↔랭킹) | ⚠️ **20%** | **이 문서의 핵심 과제** |

→ 이 분석 문서는 **P5 (탭 중복) 해소**가 목적. master-tracker P5를 20% → 100%로 종결시키는 구현 근거.

---

### 유저 페르소나 정의 (U1~U5)

| ID | 유형 | 핵심 질문 |
|----|------|-----------|
| **U1** | YouTuber 지망생 | "어떤 영상이 지금 터지고 있나?" |
| **U2** | 중소 채널 운영자 | "내 카테고리에서 어떤 포맷이 유리한가?" |
| **U3** | MCN/에이전시 담당자 | "국가별로 어떤 채널/영상이 성장 중인가?" |
| **U4** | 데이터 분석가 | "수치 기반 정렬/비교가 필요하다" |
| **U5** | 캐주얼 트렌드 탐색자 | "그냥 지금 뭐가 유행인지 보고 싶다" |

### 매핑 테이블

| 페르소나 | 홈 | 비디오 랭킹 | 급상승 | 크리에이터 인사이트 |
|---------|-----|------------|--------|------------------|
| **U1** | ⭐⭐ (Rising 섹션) | ⭐ (떡상탐지) | ⭐⭐⭐ (핵심) | ⭐⭐ (제목 패턴) |
| **U2** | ⭐ (카테고리 필터) | ⭐⭐ (기간 필터) | ⭐⭐ (카테고리 없음) | ⭐⭐⭐ (핵심) |
| **U3** | ⭐⭐ (인기채널) | ⭐⭐⭐ (국가×기간) | ⭐⭐ (국가 탭) | ⭐ (KR 고정 한계) |
| **U4** | ⭐ (정렬 불가) | ⭐⭐⭐ (테이블 정렬) | ⭐⭐ (VPH 수치) | ⭐⭐ (배수 수치) |
| **U5** | ⭐⭐⭐ (종합) | ⭐ (너무 상세) | ⭐⭐ (직관적) | ⭐ (KR 한정) |

---

## 3. 중복도 매트릭스

### 데이터 소스 중복

| | 홈 | 비디오랭킹 | 급상승 | 크리에이터인사이트 |
|--|-----|-----------|--------|-----------------|
| **홈** | — | 🔴 HIGH | 🔴 HIGH | 🟡 LOW |
| **비디오랭킹** | 🔴 HIGH | — | 🟠 MED | 🟡 LOW |
| **급상승** | 🔴 HIGH | 🟠 MED | — | 🟡 LOW |
| **크리에이터인사이트** | 🟡 LOW | 🟡 LOW | 🟡 LOW | — |

### 중복 상세 분석

#### 홈 ↔ 급상승 (🔴 HIGH)
- **동일 개념**: "지금 빠르게 오르는 영상" → 홈의 `Rising Channels 섹션` vs 급상승 전체 페이지
- **데이터 소스**: 홈은 `viralboard_data`(30일), 급상승은 `viralboard_rising` VIEW(7일)
- **정렬**: 둘 다 views_per_hour 계산 (홈은 클라이언트, 급상승은 DB)
- **차이점**: 급상승은 국가 탭 11개 + Video/Shorts 필터 있음. 홈은 카테고리 필터 있음

#### 홈 ↔ 비디오랭킹 (🔴 HIGH)
- **동일 개념**: "인기 영상 TOP N"
- **홈 Top Views**: `viralboard_data`, views DESC, 필터 후 표시
- **랭킹 rankings 모드**: `viralboard_data`, views DESC, 국가/기간/카테고리 필터
- **차이점**: 랭킹은 `viralboard_history` 순위변동 + 테이블 UI + 페이지네이션

#### 비디오랭킹 떡상탐지 ↔ 홈 Rising (🟠 MED)
- **동일 지표**: viralScore = views/subscriber_count (둘 다)
- **차이**: 랭킹 떡상탐지는 테이블 + 72h VPH 캡, 홈 Rising은 카드 + 7일 published 필터
- **limit**: 랭킹 50개, 홈 12개

#### 크리에이터 인사이트 ↔ 나머지 (🟡 LOW)
- **완전히 다른 테이블**: `viral_title_archive` (KR 전용 아카이브)
- **용도 분리**: 제목 패턴 분석, 댓글 뷰어 → 다른 3탭과 목적 상이

---

## 4. 작동 여부 (David 점검 결과 2026-05-11)

| 탭 | 기능 | 상태 | 원인 | 수정 |
|----|------|------|------|------|
| **홈** | 전체 데이터 로드 | ✅ 작동 | — | — |
| **홈** | Gaming/Music/Science 카테고리 필터 | ❌ 빈 화면 | top-200 views에 해당 카테고리 미포함 | ✅ 수정됨 (catPool 별도 쿼리) |
| **홈** | Rising Channels 정렬 | ❌ viralScore 정렬 | views_per_hour가 아닌 views/subs | ✅ 수정됨 |
| **비디오랭킹** | 인기순위 모드 | ✅ 작동 추정 | — | — |
| **비디오랭킹** | 떡상탐지 모드 | ✅ 작동 추정 | — | — |
| **급상승** | 국가 필터 클릭 | ❌ 무반응(사실: 빈결과) | `viralboard_rising` VIEW 0 rows | ✅ 수정됨 (viralboard_data fallback) |
| **급상승** | 새로고침 버튼 | ❌ 무반응(사실: 빈결과) | 동상 | ✅ 수정됨 |
| **크리에이터 인사이트** | 전체 | ✅ 작동 추정 | KR viral_title_archive 독립 | — |

> ⚠️ 비디오랭킹 / 크리에이터인사이트는 시각 점검 미완료 — 코드 상 버그 없음, DB 데이터 유무 미확인

---

## 5. 통합 옵션 3개

### 옵션 A: 1탭으로 완전 통합 (홈 강화)

**개념**: 현재 4탭 → 홈 1탭으로 통합. 홈에 `[랭킹|급상승|인사이트]` 서브탭 추가.

```
홈 (/) 
  └── [전체] [랭킹] [급상승] [인사이트]
           ↑      ↑      ↑       ↑
         현재  VR 통합  Rising  CI 통합
         홈 섹션  흡수   독립뷰  흡수
```

**장점**
- 네비게이션 간소화 (8항목 → 4항목)
- 컨텍스트 유지 (국가/카테고리 필터 공유 가능)
- URL 깔끔 (`/?tab=rising` 등)

**단점**
- 홈 page.tsx 이미 1383줄 → 추가 시 2000줄+ 예상
- Creator Insights는 `viral_title_archive` 별도 테이블 → 홈 쿼리 구조 전면 개편 필요
- 회귀 위험 최고

**개발 비용**: 크. 3주 이상 예상.

---

### 옵션 B: 2탭 (Discovery / Analytics)

**개념**: 목적 기준으로 2개 축 재편.

```
Discovery (/) → 홈 + 급상승 통합
  - 섹션: Trending | Shorts | Rising | 채널순위
  - 필터: 국가 + 카테고리
  - 목적: "지금 뭐가 뜨나?" (P1, P5)

Analytics (/analytics) → 비디오랭킹 + 크리에이터인사이트 통합
  - 섹션: 랭킹 테이블 | 떡상탐지 | 인사이트
  - 필터: 국가 + 기간 + 카테고리 + 채널사이즈
  - 목적: "수치로 분석하고 싶다" (P2, P3, P4)
```

**장점**
- 가장 명확한 목적 분리 (탐색 vs 분석)
- 홈 → Discovery는 현재 구조 유지 + 급상승 섹션 강화로 충분
- Analytics는 기존 2개 탭 병합 (비교적 독립적)

**단점**
- `/video-rankings`와 `/creator-insights` URL 변경 → SEO/북마크 깨짐
- `viral_title_archive` ↔ `viralboard_data` 두 소스를 한 페이지에 → API 복잡도 증가

**개발 비용**: 중. 1~2주 예상.

---

### 옵션 C: 3탭 (현재 구조 정리 + 급상승 통합)

**개념**: 급상승을 홈으로 흡수, 나머지 2개는 유지.

```
홈 (/) → 현재 홈 + 급상승 섹션 강화 (급상승 탭 제거)
  - Rising 섹션에 국가별 탭 11개 + Video/Shorts 필터 추가

비디오 랭킹 (/video-rankings) → 현재 유지
  - 인기순위 + 떡상탐지 현행 유지

크리에이터 인사이트 (/creator-insights) → 현재 유지
  - 완전히 다른 데이터 소스 → 건드릴 이유 없음
```

**장점**
- 변경 최소 (급상승 섹션 확장 + `/rising` redirect 추가만)
- 홈에서 이미 Rising 섹션 존재 → 자연스러운 확장
- 회귀 위험 최저
- 개발 비용 최소

**단점**
- 홈이 더 복잡해짐 (현재도 이미 1383줄)
- 비디오랭킹 떡상탐지 모드 ↔ 홈 Rising 중복 유지됨
- 근본적 정보 구조 문제 미해결

**개발 비용**: 소. 3~5일 예상.

---

## 6. 권장안 + 회귀 위험

### 권장: **옵션 C** (급상승 흡수 → 3탭 체계)

**이유**:
1. 현재 급상승 탭이 홈 Rising 섹션의 확장판임 → 중복이 명확
2. Creator Insights는 `viral_title_archive` 별도 소스 → 통합 비용 불균형
3. 비디오 랭킹은 `viralboard_history` 순위변동 기능이 독자적 → 흡수 시 기능 손실 위험
4. 현재 급상승 탭이 버그(viralboard_rising VIEW 0 rows)로 사실상 미작동 → 소거해도 사용자 손실 없음

**구체적 변경**:
- 홈 Rising 섹션에 국가 탭 11개 + Video/Shorts 토글 추가
- `/rising` → `/` redirect (SEO 보존)
- 사이드바에서 급상승 항목 제거

### 회귀 위험 목록

| 위험 | 심각도 | 완화 방법 |
|------|--------|----------|
| 홈 page.tsx 파일 크기 증가 (현 1383줄) | 🟠 중 | Rising 섹션 분리 컴포넌트화 |
| 국가 필터 상태가 홈 전체와 연동 | 🟡 저 | Rising 섹션 내부 state로 분리 |
| 기존 `/rising` 북마크 깨짐 | 🟡 저 | 301 redirect 추가 |
| catPool 쿼리 + Rising 쿼리 동시 실행 → 홈 쿼리 5개로 증가 | 🟠 중 | 카테고리 All 시 catPool 쿼리 스킵 (이미 구현됨) |
| viralboard_rising VIEW가 복구되면 중복 데이터 표시 | 🟡 저 | 홈 Rising이 별도 소스 사용 → 무관 |

---

## 7. 구현 계획

> 옵션 C 기준. 코드 수정은 David 승인 후 진행.

### Phase 1: 홈 Rising 섹션 확장 (3~4일)
**목표**: 홈에서 급상승 탭과 동일한 기능 제공

```
변경 파일: src/pages/home/page.tsx
변경 항목:
  - RisingSection 분리 컴포넌트화 (현재 VideoSection 사용 중)
  - 내부 state: risingCountry (ALL|KR|US|BR|JP|IN|GB|DE|FR|ID|MX)
  - 내부 state: risingType (ALL|LONG|SHORTS)
  - 국가 탭 11개 + Video/Shorts 토글 UI 추가
  - 홈 전체 activeCountry와 분리 (Rising 자체 국가 선택)
  - 데이터 소스: 현재 risingRaw + 새 필터 적용 OR viralboard_rising 직접 호출
```

**검증**: 국가 탭 클릭 → 영상 변경 확인

### Phase 2: 급상승 탭 제거 + Redirect (1일)
**목표**: 중복 제거, 사용자 혼란 방지

```
변경 파일:
  - src/components/feature/GlobalSidebar.tsx: NAV_ITEMS에서 /rising 제거
  - src/router/config.tsx: /rising → Navigate to="/" replace 추가
  - src/components/feature/MobileBottomNav.tsx: 확인 후 /rising 제거
```

**검증**: `/rising` 직접 접속 → 홈으로 redirect 확인

### Phase 3: 비디오 랭킹 중복 정리 (선택적, 2일)
**목표**: 비디오랭킹의 "떡상탐지" 모드와 홈 Rising의 차별화

```
옵션:
  A. 랭킹 떡상탐지 → viralScore 기준 유지 (배수 분석 특화)
  B. 홈 Rising → VPH 기준 (속도 분석 특화)
  → 두 개념이 달라 공존 가능: "얼마나 폭발적?" vs "지금 얼마나 빠르게?"
  → 코드 변경 없이 설명 텍스트만 차별화
```

### 구현 선결 조건

1. **viralboard_rising VIEW 점검**: Supabase 대시보드에서 `SELECT count(*) FROM viralboard_rising` 실행 → 0이면 v2 SQL 재적용 필요
2. **viral_title_archive 점검**: Creator Insights가 실제 데이터를 보여주는지 확인
3. **David 승인**: 옵션 선택 + Phase 1 범위 확정

---

## 부록: 파일별 쿼리 요약

| 파일 | 테이블 | limit | 정렬 | 필터 |
|------|--------|-------|------|------|
| home/page.tsx (Effect A) | viralboard_data | 200 | views DESC | country, published_at 90d |
| home/page.tsx (Effect B - Trending) | viralboard_data | 50 | views DESC | country, published_at 7d |
| home/page.tsx (Effect C - Channels) | viralboard_data | 1000 | — | country, fetched_at 30d |
| home/page.tsx (Rising Effect) | viralboard_data | 200 | views DESC | country, fetched_at 30d, subs>0 |
| home/page.tsx (catPool) | viralboard_data | 100 | views DESC | country, category IN, published_at 90d |
| video-rankings/page.tsx (rankings) | viralboard_data + viralboard_history | 200 | views DESC | country, fetched_at period |
| video-rankings/page.tsx (viral) | viralboard_data | 200 | views DESC → viralScore | country, subs>0 |
| rising/page.tsx (primary) | viralboard_rising | 100 | views_per_hour DESC | country?, is_shorts? |
| rising/page.tsx (fallback) | viralboard_data | 300 | views DESC → VPH | country?, is_shorts?, published_at 30d |
| creator-insights/page.tsx | viral_title_archive | 200/500 | viral_ratio DESC | country=KR, viral_ratio>=5, category? |

---

*작성: Claude Code / 검토 대기: David + Gemini Adversarial Review*
