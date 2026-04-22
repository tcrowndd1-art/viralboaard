# ViralBoard 데이터 수집 지침서

> 목표: "조회수"가 아니라 **"조회수를 만든 구조"** 를 데이터로 쌓는다.
> 방문자가 원하는 건 시청 숫자가 아니라 → 시청을 만든 훅 패턴이다.

---

## 1. 수집 스케줄

| 회차 | 시간 | API 키 | 수집 대상 |
|------|------|--------|---------|
| 1회 | 08:00 KST | API_KEY_1 | KR 채널 Daily Top 50 |
| 2회 | 14:00 KST | API_KEY_2 | US 채널 Daily Top 50 |
| 3회 | 20:00 KST | API_KEY_3 | 전날 대비 성장률 급등 채널 50 |

**하루 API 소비**: 약 600 units (quota 10,000 대비 6%)
- `videos.list` ×3 (1 unit × 50videos = 50 units/회)
- `channels.list` ×3 (1 unit × 50 = 50 units/회)
- 검색 없음 → `search.list`(100 units) 사용 안 함

---

## 2. 저장 데이터 스키마

### 2-1. `channel_snapshots` — 채널 일별 스냅샷
```json
{
  "channelId": "UCxxxxx",
  "name": "채널명",
  "country": "KR",
  "category": "Education",
  "date": "2026-04-21",
  "session": 1,
  "subscribers": 1200000,
  "totalViews": 450000000,
  "videoCount": 312
}
```
→ **7일치 diff = 주간 성장률**, 30일치 diff = 월간 성장률 자동 계산 가능

### 2-2. `video_snapshots` — 영상별 스냅샷 (핵심)
```json
{
  "videoId": "xxxxxxxxxxx",
  "channelId": "UCxxxxx",
  "date": "2026-04-21",
  "title": "영상 제목",
  "publishedAt": "2026-04-18T09:00:00Z",
  "ageDays": 3,
  "views": 820000,
  "likes": 42000,
  "comments": 3100,
  "duration": 58,
  "isShorts": true,
  "hookType": "secret_reveal",
  "hookScore": null,
  "viralVelocity": 273333
}
```

### 2-3. `hook_performance` — 훅별 성과 집계 (상품의 핵심)
```json
{
  "hookType": "secret_reveal",
  "category": "Education",
  "country": "KR",
  "period": "2026-W16",
  "sampleCount": 24,
  "avgViralVelocity": 185000,
  "medianViews3d": 620000,
  "topVideo": "videoId",
  "winRate": 0.71
}
```
→ **"이 카테고리에서 이 훅이 이번 주 승률 71%"** — 이게 진짜 상품

---

## 3. 훅 분류 기준

영상 제목에서 자동 분류:

| hookType | 키워드 패턴 | 예시 |
|----------|-----------|------|
| `secret_reveal` | 숨겨진, 비밀, 몰랐던, 알려지지 않은 | "FBI가 숨긴 진실" |
| `shock_stat` | %, 명 중, 조, 억, TOP | "한국인 97%가 모르는" |
| `time_limit` | 지금, 당장, 마지막, 년 안에 | "2026년 안에 꼭" |
| `paradox` | 역설, 반대로, 오히려, 틀렸다 | "잘 자려면 덜 자라" |
| `empathy_pain` | 지친다면, 힘들다면, 혹시 당신도 | "항상 피곤하다면" |
| `direct_challenge` | 틀렸다, 착각, 당신의 X는 가짜 | "당신의 기억, 전부 틀렸다" |
| `comparison_reversal` | vs, 차이, 진짜는, 실제로는 | "성공한 사람 vs 실패한 사람" |
| `immediate_value` | 방법, 하는 법, 정리, 요약 | "1분 만에 끝내는" |

---

## 4. viralVelocity 계산식

```
viralVelocity = views / max(ageDays, 1)
```

- 3일 된 영상이 82만 뷰 → velocity = 273,333
- 이게 높을수록 **알고리즘이 밀어주는 중** 이라는 신호

---

## 5. 주간/월간 랭킹 복원 방법

API 직접 호출 대신 **스냅샷 diff로 계산**:

```
weekly_views(channel) = snapshot(today).totalViews - snapshot(7days_ago).totalViews
monthly_views(channel) = snapshot(today).totalViews - snapshot(30days_ago).totalViews
```

→ 7일치 데이터만 쌓이면 주간 랭킹 자동 생성
→ 30일치 데이터만 쌓이면 월간 랭킹 자동 생성

---

## 6. 파일 저장 구조 (백엔드 없이 JSON으로 시작)

```
viralboard/data/
  snapshots/
    channels/
      2026-04-21_session1.json
      2026-04-21_session2.json
      2026-04-21_session3.json
    videos/
      2026-04-21_session1.json
  aggregated/
    hook_performance/
      2026-W16_KR.json
      2026-W16_US.json
    weekly_rankings/
      2026-W16_KR.json
    monthly_rankings/
      2026-04_KR.json
```

---

## 7. API 키 설정

`.env` 파일에 추가:
```
VITE_YT_API_KEY_1=...   # 08:00 수집용
VITE_YT_API_KEY_2=...   # 14:00 수집용
VITE_YT_API_KEY_3=...   # 20:00 수집용
```

수집 스크립트: `scripts/collect.js`
→ `node scripts/collect.js --session=1 --region=KR`

---

## 8. 다음 구현 순서

- [ ] `scripts/collect.js` — 수집 스크립트 작성
- [ ] `scripts/aggregate.js` — hook_performance 집계
- [ ] `src/services/localData.ts` — JSON 파일 읽어서 UI에 서빙
- [ ] 랭킹 페이지 Weekly/Monthly → snapshot diff 기반으로 교체
- [ ] 훅 성과 페이지 신설 (`/hook-analytics`)
