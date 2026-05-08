# ViralBoard 전체 일관성 정밀 감사
## 감사일: 2026-05-07
## 도구: 브라우저 직접 접근 + dynamic import 분석

---

## 페이지별 7항목 감사 결과 표

| 페이지 | ①카테고리 | ②카드사이즈 | ③폰트 | ④색상 | ⑤레이아웃 | ⑥데이터 | ⑦인터랙션 | 우선순위 | 핵심 문제 1줄 |
|--------|----------|-----------|------|------|----------|--------|----------|--------|------------|
| /home | 🟡 | 🟡 | 🟡 | ✅ | 🟡 | 🟡 | ✅ | HIGH | 카테고리 필터 없음, max-w-full 비일관, line-clamp 미적용 |
| /rankings | 🟡 | 🟡 | ✅ | ✅ | 🟡 | ❌ | ✅ | HIGH | YT API 의존 mock 없음, 로딩/스켈레톤 없음, null safe 전무 |
| /video-rankings | ❌ | 🟡 | ✅ | ✅ | ✅ | 🟡 | ✅ | CRITICAL | 카테고리 4개(Technology/News/Education/Kids) DB에 0건 |
| /search | 🟡 | 🟡 | 🟡 | ✅ | ✅ | 🟡 | 🟡 | MED | Supabase 미사용, VideoModal 없음, URL 필터 동기화 없음 |
| /creator-insights | ❌ | 🟡 | ✅ | ✅ | 🟡 | 🟡 | ✅ | CRITICAL | 한글 카테고리 버튼 DB 매핑 없음, catch 1개뿐 |
| /trending-live | 🟡 | ✅ | 🟡 | ❌ | ❌ | ❌ | 🟡 | HIGH | 100% mock, lg:ml-52 누락, dark모드 미지원, catch 0개 |
| /ai-studio | N/A | N/A | ✅ | ✅ | ❌ | N/A | ✅ | LOW | 전용 레이아웃, 사이드바/TopHeader 없음 (의도적) |
| /dashboard | N/A | 🟡 | ✅ | ✅ | ❌ | ❌ | 🟡 | HIGH | 미로그인 시 로그인 페이지 리다이렉트, catch/supabase 없음 |
| /comment-manager | N/A | N/A | ✅ | ✅ | ✅ | ❌ | ✅ | MED | catch 0개, 로딩상태 없음, null safe 전무 |
| /video-editor | N/A | N/A | ✅ | ✅ | ❌ | N/A | ✅ | LOW | 전용 레이아웃, 에러핸들링 전무 (의도적) |
| /chrome-extension | N/A | ✅ | 🟡 | ✅ | ❌ | N/A | ✅ | LOW | 마케팅 랜딩페이지, 사이드바 없음 (의도적) |
| /rising | ❌ | ✅ | 🟡 | ✅ | ✅ | 🟡 | 🟡 | HIGH | 카테고리 필터 UI 없음, DB 대소문자 혼용, URL 동기화 없음 |

---

## 카테고리 상세 분석

### /video-rankings 카테고리 버튼 vs DB 매핑
| UI 버튼 | DB 실제 키 | DB 건수 | 상태 |
|--------|----------|--------|-----|
| All Categories | - | - | ✅ |
| Entertainment | entertainment | 334건 | ⚠️ 대소문자 불일치 |
| Music | music | 291건 | ✅ |
| Technology | (없음) | 0건 | ❌ → science_tech(254건)로 교체 |
| Gaming | gaming | 1,349건 | ✅ |
| Sports | sports | 432건 | ✅ |
| News | (없음) | 0건 | ❌ → news_politics(684건)로 교체 |
| Education | (없음) | 0건 | ❌ DB에 없음 |
| Kids | (없음) | 0건 | ❌ DB에 없음 |

### /creator-insights 카테고리 vs DB 매핑
- UI: 먹방, 예능·드라마, 개그·유머, 반려동물, 야구·축구, 재테크·주식, 음악·댄스, 요리레시피, 뷰티·패션, 육아·일상, 교육·과학, 게임, 과학, 건강
- DB(viral_title_archive): autos_vehicles, film_animation, pets_animals, howto_style, sports, entertainment, science_tech, music, comedy, people_blogs, news_politics
- 매핑 코드: 없음 → 모든 카테고리 버튼 클릭 시 0건

### /rising 카테고리 현황
- 카테고리 필터 UI: 없음 (국가+Shorts 필터만)
- DB 비정규화: Self-Dev(327건)/Science(294건)/Psychology(255건)/Entertainment(128건) 대문자 혼용

### categoryMap.ts 분석
- VISIBLE_CATEGORIES: All/Entertainment/Gaming/Music/Sports/Science/Psychology/Self-Dev/Other
- normalizeCategory() 버그: niche_* 값 처리 없음 → niche_finance, niche_gaming 등 그대로 반환

---

## 레이아웃 일관성 상세

| 페이지 | lg:ml-52 | TopHeader | pt-12 | max-w-7xl |
|--------|---------|---------|------|----------|
| /home | ✅ | ✅ | ✅ | ❌ (max-w-full) |
| /rankings | ✅ | ✅ | ✅ | ❌ (없음) |
| /video-rankings | ✅ | ✅ | ✅ | ✅ |
| /search | ✅ | ✅ | ✅ | ✅ |
| /creator-insights | ✅ | ✅ | ✅ | ❌ (max-w-3xl) |
| /trending-live | ❌ | ✅ | ✅ | ❌ (max-w-6xl) |
| /ai-studio | ❌ | ❌ | ❌ | ❌ |
| /dashboard | ❌ | ❌ | ❌ | ❌ |
| /comment-manager | ✅ | ✅ | ✅ | ❌ (없음) |
| /video-editor | ❌ | ❌ | ❌ | ❌ |
| /chrome-extension | ❌ | ❌ | ❌ | ❌ |
| /rising | ✅ | ✅ | ✅ | ✅ (기준) |

---

## 데이터 안전성 상세

| 페이지 | ?. | catch수 | loading | DB테이블 |
|--------|---|--------|--------|---------|
| /home | ✅ | 4 | ✅ | viralboard_data |
| /rankings | ❌ | 2 | ❌ | YouTube API |
| /video-rankings | ❌ | 2 | ❌ | viralboard_data, viralboard_history |
| /search | ❌ | 2 | ✅ | (없음) |
| /creator-insights | ✅ | 1 | ✅ | viral_title_archive |
| /trending-live | ✅ | 0 | ❌ | mock |
| /ai-studio | ❌ | 0 | ❌ | (없음) |
| /dashboard | ✅ | 0 | ❌ | mock |
| /comment-manager | ❌ | 0 | ❌ | (없음) |
| /video-editor | ❌ | 0 | ❌ | (없음) |
| /chrome-extension | ❌ | 0 | ❌ | (없음) |
| /rising | ❌ | 1 | ✅ | viralboard_rising |

---

## 통합 권장사항 TOP 5

### 1. [CRITICAL] 카테고리 DB 정규화 (DB 수정)
```sql
UPDATE viralboard_rising SET category = 'self_dev' WHERE category = 'Self-Dev';
UPDATE viralboard_rising SET category = 'science' WHERE category = 'Science';
UPDATE viralboard_rising SET category = 'psychology' WHERE category = 'Psychology';
UPDATE viralboard_rising SET category = 'entertainment' WHERE category = 'Entertainment';
-- viralboard_data도 동일 적용
```

### 2. [CRITICAL] /video-rankings 카테고리 버튼 교체
- Technology → science_tech (254건)
- News → news_politics (684건)
- Education, Kids → 제거 (0건)

### 3. [CRITICAL] /creator-insights 카테고리 매핑 추가
```typescript
const KO_TO_DB = {
  '먹방': 'people_blogs', '예능·드라마': 'entertainment',
  '반려동물': 'pets_animals', '야구·축구': 'sports',
  '음악·댄스': 'music', '게임': 'gaming',
  '요리레시피': 'howto_style', '교육·과학': 'science_tech',
  '과학': 'science_tech', '건강': 'howto_style',
};
```

### 4. [HIGH] /rising 카테고리 필터 UI 추가
categoryMap.ts의 VISIBLE_CATEGORIES 사용, useState + .eq('category') 추가

### 5. [HIGH] normalizeCategory() niche_* 폴백 추가
```typescript
// 기존 normalizeCategory 마지막에 추가
if (cat.startsWith('niche_')) return 'Other';
```
