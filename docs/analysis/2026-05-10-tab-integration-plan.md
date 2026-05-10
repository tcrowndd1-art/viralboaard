---
date: 2026-05-10
type: plan
target: 4탭 통합 (떡상 / 급상승 / 인사이트 / 채널 랭킹)
priority: medium
status: open
triggered_by: David 5/9 분노 #5 ("랭킹탭 안에 떡상탐지까지... 겹치는 구조 통합")
triggered_action: 0905-cycle1 G5 (구현 X, 설계만)
affected_code:
  - "[[src/pages/home/page.tsx]] 떡상 섹션"
  - "[[src/pages/rising/page.tsx]]"
  - "[[src/pages/creator-insights/page.tsx]]"
  - "[[src/pages/rankings/page.tsx]]"
related_insights:
  - "[[2026-05-10-plan-0905-1차-v4]]"
---

# 0905-cycle1 G5 — 4탭 통합 설계 (구현 X)

## 1. 현재 4탭 분석

### a) 떡상 탐지 (홈 섹션)
| 항목 | 값 |
|---|---|
| 위치 | `src/pages/home/page.tsx` (Home Rising Channels 섹션, line 1249-1283) |
| 데이터 source | `viralboard_data` 테이블 직접 |
| 시간 윈도우 | published_at ≥ 7일 (G3 fix `52fa5c8`) |
| 추가 필터 | `subscriber_count > 0`, `viral_ratio = views/subs >= 100`, `is_shorts = false`, `fetched_at ≥ 30일` |
| 정렬 | `viralScore = views / subscribers` DESC |
| 카드 형태 | VideoCard (G4.1 적용 — 우측 2x2 메타 md+) |
| 노출 개수 | 12 (slice) → 페이지당 8 |
| 사용자 의도 | "구독자 대비 폭발한 영상" — 작은 채널의 viral hit 발견 |

### b) 급상승 (Rising 페이지)
| 항목 | 값 |
|---|---|
| 위치 | `src/pages/rising/page.tsx` |
| 데이터 source | `viralboard_rising` SQL view (`viralboard_data + viralboard_history` 조인) |
| 시간 윈도우 | view 내장 `published_at > NOW() - 7 days` (`migrate_rising_view_v2.sql:37`) |
| 추가 필터 | country, is_shorts (toggle), DISTINCT ON video_id |
| 정렬 | `views_per_hour` DESC (실시간 시간당 증가량) |
| 카드 형태 | 자체 카드 (G4.1 적용 — 우측 2x2 메타 md+) |
| 노출 개수 | 100 (LIMIT) |
| 사용자 의도 | "지금 폭발 중인 영상" — 시간 단위 트렌드 추적 |

### c) 크리에이터 인사이트
| 항목 | 값 |
|---|---|
| 위치 | `src/pages/creator-insights/page.tsx` |
| 데이터 source | `viral_title_archive` 테이블 (별도 archive) |
| 시간 윈도우 | 메모리 필터 (period 7/30/90일) |
| 추가 필터 | `country='KR'` (기본), `viral_ratio >= 5`, channelSize/videoType 메모리 필터 |
| 정렬 | `viral_ratio` DESC |
| 카드 형태 | 별도 (제목 + 카테고리 + viral_ratio 강조) |
| 노출 개수 | 500 (전체) / 200 (카테고리 필터 시) |
| 사용자 의도 | "검증된 viral 제목 패턴 학습" — 콘텐츠 기획 자료 |

### d) 채널 랭킹
| 항목 | 값 |
|---|---|
| 위치 | `src/pages/rankings/page.tsx` |
| 데이터 source | `viralboard_data` (현재) + `viralboard_history` (1일 전 스냅샷) |
| 시간 윈도우 | `fetched_at` 1/7/30일 토글 |
| 추가 필터 | country |
| 정렬 | `subscribers` DESC |
| 카드 형태 | 채널 row (썸네일 + 채널명 + 구독자 + 변동) |
| 노출 개수 | 50 |
| 사용자 의도 | "큰 채널의 흐름 추적" — 채널 성장률/순위 변동 |

---

## 2. 겹침 매트릭스 (4탭 × 4탭)

### 2.1 데이터 source 중복도

| | 떡상 | 급상승 | 인사이트 | 채널랭킹 |
|---|---|---|---|---|
| **떡상** | — | **80%** (data vs rising-view of same data) | 20% (archive ⊂ data) | 30% (data + history) |
| **급상승** | 80% | — | 15% (archive 별도) | 30% (data + history) |
| **인사이트** | 20% | 15% | — | 5% (archive vs channels) |
| **채널랭킹** | 30% | 30% | 5% | — |

→ **떡상 ↔ 급상승 = 같은 데이터 (80%)**, 메트릭만 다름. 핵심 통합 후보.
→ 인사이트는 archive 테이블 분리 = 독립성 강함.
→ 채널 랭킹은 영상 단위 X 채널 단위 = 카드 형태/축이 다름.

### 2.2 사용자 의도 중복도

| | 떡상 | 급상승 | 인사이트 | 채널랭킹 |
|---|---|---|---|---|
| **떡상** | — | **70%** ("폭발 중인 영상") | 25% (단 archive 검증된 영상) | 10% (영상 vs 채널) |
| **급상승** | 70% | — | 25% (실시간 vs 검증) | 10% |
| **인사이트** | 25% | 25% | — | 0% (제목 학습 vs 채널 추적) |
| **채널랭킹** | 10% | 10% | 0% | — |

→ **떡상 ↔ 급상승 = 의도 70% 겹침**. 사용자가 두 탭 모두 들어오는 이유 = "어디가 뜨고 있나"
→ 차이는 메트릭 (viralScore = 비율 / views_per_hour = 절대 속도)

### 2.3 종합

**고겹침 (제거/통합 후보)**: 떡상 ↔ 급상승 (data 80% / 의도 70%)
**저겹침 (분리 유지)**: 인사이트 (archive 자료 학습), 채널 랭킹 (채널 단위)

---

## 3. 통합 안 3개

### 안 A — 스마트 삭제 (떡상 흡수)

**개념**: 떡상 섹션 (홈)을 제거 → 사용자를 급상승 탭으로 유도. 단 급상승 탭에 "비율 모드 (views/subs)" 토글 추가.

**구현**:
- 홈에서 떡상 섹션 컴포넌트 제거
- 급상승 페이지에 정렬 토글: `views_per_hour` (속도) | `viral_ratio` (비율)
- viralboard_rising view에 `viral_ratio` 컬럼 추가 (이미 d.viral_ratio 있음 — line 14)

**장점**:
- 데이터 source 단일화 (rising view → 모든 곳)
- 사용자 혼란 감소 (1탭 = 1진실)
- 코드 ~80줄 감소 (홈 떡상 effect + 컴포넌트)

**단점**:
- 홈 메인 페이지 정보 밀도 ↓ (사용자가 즉시 viral 못 봄)
- 급상승 탭 의존도 ↑

**구현 난이도**: 🟡 중간 (rising view에 정렬 옵션 + 홈 effect 제거)
**사용자 영향**: 🔴 적응 필요 (홈에 뜨던 떡상 사라짐)
**예상 작업**: 90분

---

### 안 B — Rankings 통합 토글

**개념**: 모든 viral/rising/ranking을 단일 `/rankings` 페이지로 통합. 상단 토글: `영상` | `채널` | `검증 archive`

**구현**:
- `src/pages/rankings/page.tsx` 확장 (현재 채널만)
- 토글 추가: `영상 / 채널 / Archive`
- 각 모드에서 sub-필터: 영상 = 정렬(views_per_hour|viral_ratio|views), 채널 = 시간(1/7/30일), archive = 기존 인사이트
- 메뉴: `/rising` → `/rankings?mode=video`, `/creator-insights` → `/rankings?mode=archive`

**장점**:
- URL 1개 = SEO/공유 단순
- 메뉴 단순화 (4 → 1)
- 토글 UX = 사용자가 직접 비교 가능

**단점**:
- 한 페이지 책임 과다 (3가지 다른 데이터 source)
- 라우트 redirect (기존 북마크 깨짐)
- 페이지 무거움 (모든 fetch logic 합침)

**구현 난이도**: 🔴 높음 (3페이지 합치기 + 라우트 redirect + 토글 UI)
**사용자 영향**: 🔴 높음 (URL 변경, 학습 비용)
**예상 작업**: 240분 (4시간)

---

### 안 C — 라벨/메뉴만 변경 (구조 유지)

**개념**: 코드 구조 변경 X. 메뉴명/라벨만 정리해서 사용자 혼란 감소.

**구현**:
- 메뉴명 통일:
  - "떡상 탐지" → "떡상 영상" (홈 내부, 그대로)
  - "급상승" → "실시간 급상승" (시간당 증가량 명시)
  - "크리에이터 인사이트" → "Viral 제목 학습" (의도 명시)
  - "채널 랭킹" → "채널 순위" (그대로)
- 각 탭 상단에 한 줄 설명 추가:
  - 떡상: "구독자 대비 폭발한 영상 (소형 채널 viral hit)"
  - 급상승: "지금 시간당 가장 많이 보는 영상"
  - 인사이트: "검증된 viral 제목 패턴 (콘텐츠 기획용)"
  - 채널 순위: "구독자 기준 큰 채널의 성장률"
- 코드 변경: 메뉴 컴포넌트 + 각 페이지 헤더 (총 ~30줄)

**장점**:
- 구조 변경 0 = 회귀 위험 최소
- 사용자 학습 비용 0 (이미 친숙한 위치)
- 빠르게 혼란 해소

**단점**:
- 근본 통합 X (데이터 중복은 그대로)
- 코드 정리 효과 0
- "왜 두 탭이 비슷한가" 의문은 남음 (하지만 라벨로 차이 명시)

**구현 난이도**: 🟢 낮음
**사용자 영향**: 🟢 낮음 (혼란 감소, 학습 비용 0)
**예상 작업**: 45분

---

## 4. 권장안 + 0905-2차 작업 분해

### 권장: **안 C → 안 A 단계 마이그레이션**

#### 1단계 — 0905-2차 = 안 C (45분)
- 빠른 사용자 혼란 해소
- 회귀 위험 0
- "측정 후 결정" — 라벨 명확화 후 사용자가 어느 탭에 진짜 들어오는지 추적

#### 2단계 — 0905-3차 (또는 사용자 데이터 후) = 안 A (90분)
- 1단계 운영 2주 후 메트릭 확인
- 떡상 사용자 < 5% 또는 떡상↔급상승 동선 70%+ 확인 시 진행
- 안 A 진행 = 떡상 흡수 + rising view 정렬 토글

#### 보류 — 안 B
- 1단계 → 2단계 후 통합 만족도 측정
- 채널 랭킹과 인사이트는 차별점 분명 (채널 단위 / archive 학습) → 통합 X 권장
- 안 B는 너무 광범위, 사용자 영향 크고 ROI 낮음

### 0905-2차 작업 분해 (안 C 기준)

| Sub | 작업 | 시간 | 파일 |
|---|---|---|---|
| C-1 | 메뉴명 통일 (Sidebar 컴포넌트) | 10분 | `src/components/GlobalSidebar.tsx` |
| C-2 | 떡상 섹션 부제 추가 | 5분 | `src/pages/home/page.tsx` |
| C-3 | 급상승 페이지 부제 + 메트릭 설명 | 10분 | `src/pages/rising/page.tsx` |
| C-4 | 인사이트 페이지 부제 | 5분 | `src/pages/creator-insights/page.tsx` |
| C-5 | 채널 순위 페이지 부제 | 5분 | `src/pages/rankings/page.tsx` |
| C-6 | i18n 키 추가 (한 줄 설명 4개) | 10분 | `public/locales/*` |

**합계**: 45분 (단독 commit 1회)

### 0905-3차 안 A 작업 분해 (조건부)

| Sub | 작업 | 시간 |
|---|---|---|
| A-1 | viralboard_rising view에 viral_ratio 정렬 인덱스 검증 | 15분 |
| A-2 | rising 페이지 정렬 토글 UI 추가 (`views_per_hour` / `viral_ratio`) | 30분 |
| A-3 | 홈 떡상 섹션 컴포넌트 제거 + state cleanup | 30분 |
| A-4 | 떡상 → 급상승 redirect 안내 (1주) | 15분 |

**합계**: 90분

---

## 5. 핵심 의사결정 포인트 (David 컨펌)

1. **안 C 즉시 진행 OK?** (0905-2차 첫 작업)
2. **안 A 트리거 메트릭 정의**: 떡상 사용량 < 5%? 또는 사용자 피드백?
3. **메뉴명 4개 후보 OK?** 또는 다른 명명?
   - 떡상 영상 / 실시간 급상승 / Viral 제목 학습 / 채널 순위

---

## 6. 0905-2차 백로그 등록 항목 (G5 결과)

- [ ] 안 C 라벨 정리 (45분, C-1~C-6)
- [ ] 사용량 메트릭 측정 인프라 (Supabase analytics 또는 Posthog) — 안 A 트리거 판단용
- [ ] 안 A 트리거 시 0905-3차 진입

## 7. 결론

**탭 통합은 단계적 접근이 안전**. 즉시 안 B 같은 광범위 통합 = 사용자 혼란 + 회귀 위험 ↑. 안 C로 라벨만 정리 → 측정 → 안 A 결정.

본 문서는 **설계만**. 실제 작업은 0905-2차에서 안 C 진입 컨펌 후.
