---
date: 2026-05-08
type: exploration
target: [rising, creator-insights, fetch_phase1]
priority: high
status: open
triggered_by: User Report (2026-05-08)
affected_code:
  - "[[src/pages/rising/page.tsx]]"
  - "[[src/pages/creator-insights/page.tsx]]"
  - "[[backend/scripts/fetch_phase1.py]]"
  - "[[schema/viralboard_schema_v2.sql]]"
---

# Issue Investigation: Rising Freshness & Creator Insights Data (2026-05-08)

## 1. Rising Page "Lifetime Average" Issue
**Problem:** `views_per_hour`가 수집 시점 간의 실시간 스파이크가 아닌, 과거 데이터와의 긴 간격으로 인해 평균화되어 계산되는 현상.

**Analysis of `viralboard_rising` VIEW:**
- 현재 뷰는 `viralboard_history`에서 가장 최근 레코드(`ORDER BY fetched_at DESC LIMIT 1`)를 조인함.
- `fetch_phase1.py`가 15분마다 실행될 때, 정상적으로는 15분간의 델타가 잡혀야 함.
- **가설:**
    1. **재진입 문제:** 영상이 `mostPopular`에서 사라졌다가 며칠 뒤 다시 나타나면, 며칠 전의 `history`와 비교하게 되어 "며칠간의 평균"이 계산됨.
    2. **초기 수집 데이터 부족:** 신규 영상의 경우 비교 대상이 없어 급상승에 노출되지 않거나, 첫 비교 시점에 큰 수치가 잡힘.

**Proposed Solution:**
- `viralboard_rising` 뷰를 수정하여 "최근 1시간" 또는 "최근 3시간" 이내의 데이터가 있을 때만 델타를 계산하도록 시간 범위를 제한.
- 혹은 `fetch_phase1.py`에서 수집 시 `current_vph`를 계산하여 `viralboard_data` 테이블에 직접 저장하는 방식 고려.

## 2. Creator Insights "Health" Data Shortage
**Problem:** "건강" 카테고리가 587건의 `howto_style` 데이터 중 5건만 노출됨.

**Analysis:**
- `creator-insights/page.tsx`는 다음 필터를 적용 중: `country = 'KR'`, `viral_ratio >= 5`, `days_since_published <= 90`.
- **가설:**
    1. **국가 불일치:** `howto_style` 데이터의 대부분이 US/BR 등 해외 데이터일 가능성.
    2. **Viral Ratio 임계값:** 정보성 영상(건강/교육)은 엔터테인먼트에 비해 `viral_ratio`가 낮게 형성됨 (5.0이 너무 높음).
    3. **키워드 간섭:** "건강" 전용 키워드 필터가 없어 다른 `howto_style`(요리, 패션)에 묻혀 있거나, 반대로 너무 엄격한 필터가 있을 수 있음.

**Proposed Action:**
- Supabase에서 직접 KR 국가의 `howto_style` 카테고리 `viral_ratio` 분포 확인.
- 카테고리별로 `viral_ratio` 임계값을 조정하거나(예: 건강은 2.0 이상), 특정 키워드(건강, 다이어트, 운동 등) 기반 서브 필터링 도입 검토.

## 3. Next Steps
- [ ] Supabase SQL 쿼리로 카테고리별 데이터 분포 상세 분석.
- [ ] `viralboard_rising` 뷰의 시간 제한 조건(`fetched_at > NOW() - INTERVAL '3 hours'`) 추가 제안.
- [ ] Rising 카테고리 필터 UI 구현 (BACKLOG 항목).
