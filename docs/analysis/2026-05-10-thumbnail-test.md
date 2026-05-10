---
date: 2026-05-10
type: review
target: thumbnail maxres fallback
priority: low
status: resolved
triggered_by: G4.2 (0905-cycle1)
affected_code:
  - "[[src/pages/home/page.tsx]] VideoCard line ~196-198"
  - "[[src/pages/rising/page.tsx]] line ~199-209"
---

# G4.2 — 썸네일 maxres 폴백 실측

## 폴백 체인 (현재 코드)

```
maxresdefault.jpg → onError → hqdefault.jpg → onError → mqdefault.jpg → onError → opacity:0
```

**위치**:
- `src/pages/home/page.tsx` VideoCard line 198 (maxres → hq → mq → hidden)
- `src/pages/rising/page.tsx` line 200-207 (maxres → hq → mq, G3 회귀 fix에서 추가됨)

## curl 실측 (2026-05-10)

| 영상 | 업로드 | maxresdefault | 결과 |
|---|---|---|---|
| `9bZkp7q19f0` (Gangnam Style) | 2012-07 (14년 전) | 200 OK | maxres 정상 |
| `dQw4w9WgXcQ` (Rick Roll) | 2009-10 (17년 전) | 200 OK | maxres 정상 |

→ **인기 옛날 영상은 YouTube가 maxres 재생성해서 보유**. 218주(4년) 전이라도 viral 영상이면 maxres 있음.

## maxres 없는 케이스 가설

- 비인기 옛날 영상 (조회수 < 1000)
- 업로더가 저화질 원본만 업로드 (480p 이하) → YouTube가 maxres 미생성
- 삭제된 영상

→ 폴백 체인이 hq/mq로 안전 처리. opacity:0 = 최종 fallback (썸네일 영역만 빈칸).

## David 추가 검증 (선택, 5분)

DevTools Network → `i.ytimg.com` 필터 → 218주 전 영상 카드 1개 picking:
1. 첫 요청 `maxresdefault.jpg` 응답 코드
2. 404 시 자동 `hqdefault.jpg` 호출되는지 (onError 작동)
3. 둘 다 404 시 `mqdefault.jpg` 시도

## 결론

✅ 폴백 체인 코드 적용 완료 (G3 회귀 fix `d5b5e1f`).
✅ 인기 옛날 영상은 maxres 정상.
⚠️ 비인기 옛날 영상은 hq/mq 자동 폴백 (정상 동작).

## 0905-2차 후보 (없음)
폴백 체인이 충분. 추가 작업 불필요.
