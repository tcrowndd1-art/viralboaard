# YouTube API Quota 진단 보고서
## 진단일: 2026-05-08 19:44 KST
## 도구: 코드 정독 + Windows 작업 스케줄러 + 로그 grep

---

## 1. Fetcher 파일 위치 (4개, 사용자 7개 언급은 추정)

| # | 파일 | 호출 API | 역할 |
|---|------|---------|------|
| 1 | `backend/scripts/fetch_phase1.py` | `videos.list`, `channels.list`, `playlistItems.list`, `search.list` | 메인 트렌딩 + 신선도 |
| 2 | `backend/scripts/fetch_cpm_channels.py` | `search.list`(channel), `channels.list` | 고CPM 키워드 채널 |
| 3 | `backend/scripts/fetch_niche_channels.py` | `search.list`(video), `videos.list`, `channels.list` | 니치 키워드 영상 |
| 4 | `backend/scripts/fetch_viral_titles.py` | `videos.list mostPopular`, `channels.list` | viral_title_archive 일일 수집 |

보조 모듈 (API 미호출): `cpm_keywords.py`, `niche_keywords.py`, `save_session.py`, `_test_edge.py`, `_verify_cpm.py`

---

## 2. 각 Fetcher 호출 비용 분석

### 2.1 fetch_phase1.py (full 모드)
- **트랙 1**: `mostPopular` × 14 카테고리 × 24 국가 = **336 calls × 1u = 336u**
- **레퍼런스 채널**: 5채널 × 3 calls (channels.list + playlistItems.list + videos.list) = **15u**
- **channels.list 일괄**: 약 1680 unique channels / 50 batch = **~34u**
- **fresh_track** (`fetch_fresh_videos`): `search.list` (100u) + `videos.list` (1u) = **101u/국가**
  - PRIORITY 3국 + SECONDARY 21국 = **24 × 101 = 2,424u** (quota_exhausted 트리거 시 SECONDARY 중단 → 303u)
- **합계 (worst case)**: ~**2,809 units/run**

### 2.2 fetch_phase1.py --fresh-only
- 24 국가 × 101u = **~2,424 units/run** (quota 조기 소진 시 303u)

### 2.3 fetch_cpm_channels.py
- 8 niches × 3-4 keyword/country pairs = **25 pairs**
- 각 pair = `search.list type=channel` (100u) + `channels.list` 1batch (1u) = **101u**
- **합계**: 25 × 101 = **2,525 units/run**

### 2.4 fetch_niche_channels.py 🔴 가장 비쌈
- 20 niches × 2-3 pairs = **59 pairs**
- 각 pair = `search.list type=video` (100u) + `videos.list` (1u) = **101u**
- 추가 channels.list 일괄 = **~6u**
- **합계**: 59 × 101 + 6 = **5,965 units/run**

### 2.5 fetch_viral_titles.py
- 13 카테고리 × `mostPopular` (1u) + `channels.list` (1u/카테고리) = **~26 units/run** (가장 저렴)

---

## 3. Windows 작업 스케줄러 (실측)

| TaskName | 실행 주기 | 시작 | 호출 스크립트 | 상태 |
|----------|---------|------|------------|------|
| ViralBoard_Fetcher | **매 30분** | (반복) | `run_fetcher.ps1` → `fetch_phase1.py` (full) | ✅ 정상 |
| ViralBoard_Fresh | **매 1시간** | (반복) | `run_fresh.ps1` → `fetch_phase1.py --fresh-only` | ✅ 정상 |
| ViralBoard_Niche | **매일 03:00** | 1회/일 | `run_niche.ps1` → `fetch_niche_channels.py` | 🔴 **-1073741510 (DLL init 실패)** |
| ViralBoard_CPM | **매일 04:00** | 1회/일 | `run_cpm.ps1` → `fetch_cpm_channels.py` | 🔴 **-1073741510 (DLL init 실패)** |
| ViralBoard_TitleArchive | **매일 04:00** | 1회/일 | `fetch_viral_titles.py` | ✅ 정상 |
| ViralBoard_AutoSession | 매일 23:00 | 1회/일 | `save_session.py` | API 미호출 |

**ⓘ 결정적 발견**: Niche/CPM 작업이 **DLL init 실패로 매일 0초 만에 종료** — 오늘자 로그 `niche_2026-05-08.log`/`cpm_2026-05-08.log` 둘 다 시작 배너 1줄만 존재. 즉 **고비용 fetcher 2개는 quota를 전혀 안 쓰고 있음**.

---

## 4. 일일 Quota 계산 (이론치 vs 실측)

### 4.1 이론 일일 호출 (Niche/CPM 정상 작동 가정)

| Fetcher | 비용/run | 실행/일 | 일일 합계 |
|---------|---------|--------|---------|
| fetch_phase1 (full) | 2,809u | **48** (30분) | **134,832u** |
| fetch_phase1 --fresh-only | 2,424u | **24** (1시간) | **58,176u** |
| fetch_niche_channels | 5,965u | 1 | 5,965u |
| fetch_cpm_channels | 2,525u | 1 | 2,525u |
| fetch_viral_titles | 26u | 1 | 26u |
| **합계** | | | **~201,524 units/day** |

### 4.2 키 가용량
- 환경변수 `YOUTUBE_API_KEY_1~7` = **7개 키**
- 키당 일일 한도 = 10,000u
- **총 한도 = 70,000 units/day**

### 4.3 갭
- 이론 사용 / 한도 = **201,524 / 70,000 ≈ 2.88×** 초과 → **초과량 131,524u/day**

### 4.4 실측 (오늘 fetcher_2026-05-08.log)
- Phase 1 fetcher 실행 횟수: **40회** (19:44 시점, 정상)
- 403 Client Error: **10,324회** (404와 분리: 404는 672회 = nonprofits 카테고리 정상 누락)
- `[QUOTA]` 표식: **0회** ← 코드 버그: 카테고리 try/except가 403을 일반 실패로만 처리, fresh_track만 quota 감지
- fresh_track 오늘 결과: 24개국 모두 **0건 저장** ← quota 소진 확정
- 평균 403/run = 10,324 / 40 = **258 / run** (336 mostPopular 호출 중 76% 실패)

---

## 5. 결론

### 5.1 진짜 quota 부족 (Yes)
**이론 ~200K units/day vs 한도 70K = 약 2.9× 초과 설계**. Niche/CPM 작업이 죽어있어 실측은 이론치보다 약간 낮지만 (~193K/day 상한) 여전히 한도의 **2.75×**. 결과: 매일 오전부터 키 라운드로빈이 모두 소진 → 오후엔 거의 모든 호출 403.

### 5.2 키 rotation 깨졌나? (No, 로직 정상)
3개 fetcher 모두 동일한 패턴:
```python
_key_idx = 0
def next_key():
    global _key_idx
    k = API_KEYS[_key_idx % len(API_KEYS)]
    _key_idx += 1
    return k
```
모듈 단위 글로벌 카운터로 round-robin. **`_key_idx`는 동일 프로세스 내 모든 호출에 균등 분배**. 다만:
- ✅ rotation 자체는 정상
- ❌ **403 받으면 다음 키로 fall-back 시도하지 않음** — quota 소진된 키도 그대로 다시 사용
- ❌ **별도 프로세스 (Fetcher / Fresh / Niche / CPM)** 사이엔 카운터 공유 안 됨 → 각 프로세스가 처음부터 KEY_1 우선 사용 → 키 1, 2번이 먼저 터짐

### 5.3 특정 fetcher 비효율
| 우선순위 | 항목 | 문제 |
|---------|------|------|
| 🔴 1위 | `fetch_phase1.py` 전체 빈도 | **30분 = 일 48회**. 트렌딩이 30분마다 바뀌지 않음. **6시간 = 일 4회**로도 충분 |
| 🔴 2위 | `fresh_track` SECONDARY 21국 | 국가당 101u × 21 = 2,121u/run. fresh-only가 1시간마다 = 일 50,904u 소비. Top 3국만 유지 시 **303u/run × 24 = 7,272u** (-87%) |
| 🟠 3위 | `search.list` 100u 비용 | YouTube 가장 비싼 엔드포인트. 모든 fetcher가 사용. niche/cpm은 100u × 25-59회 |

---

## 6. 즉시 픽스 후보 (우선순위순)

### A. 빈도 낮추기 (가장 큰 효과, 코드 수정 최소)
- `ViralBoard_Fetcher` 30분 → **6시간** (48회 → 4회). 절감: **123,596u/day** (-92%)
- `ViralBoard_Fresh` 1시간 → **3시간** (24회 → 8회). 절감: **38,784u/day** (-67%)
- 합산 절감: ~**162K/day** → 신규 일일 사용량 ~**40K** (한도 70K 내 안전)

### B. fresh_track SECONDARY 국가 축소
- 21개국 → 0개국 (PRIORITY KR/US/BR만 유지)
- 절감: 2,121u × (24+48 if both runs) = 잠재 ~150K/day. A와 중복. A를 먼저 적용하면 B는 선택.

### C. search.list 캐싱 / 빈도 분리 (구조 변경)
- niche/cpm은 어차피 일 1회. 결과를 30일 cache → 키워드별 재조회를 월 1회로
- 단, 현재 niche/cpm은 DLL init 실패로 미작동 → 부활시키기 전에 적용

### D. Niche/CPM 작업 부활 여부 결정
- **부활 조건**: 빈도 픽스 (A) 적용 후 일일 잔여 = 70K - 40K = 30K. niche+cpm = 8.5K → 충분
- **부활 방법**: `-1073741510` 진단 → 통상 venv DLL 미일치. `python.exe` 절대경로 확인 + venv 재생성

### E. quota 인식 강화 (코드 수정)
- `fetch_category()` try/except에 403 분기 추가 → quotaExceeded 감지 시 즉시 키 회전 또는 전체 중단
- 현재는 카테고리별로 똑같이 403 폭격 → 로그만 부풀고 quota 더 소진

---

## 7. 우선 수정 권장 (수정 금지 모드 — 컨펌 후 작업)

| # | 작업 | 파일 | 영향 |
|---|------|------|------|
| 1 | ViralBoard_Fetcher 30분 → 6시간 | 작업 스케줄러 (코드 X) | -123K u/day |
| 2 | ViralBoard_Fresh 1시간 → 3시간 | 작업 스케줄러 (코드 X) | -38K u/day |
| 3 | fresh_track SECONDARY 21국 제거 | `fetch_phase1.py:67-72` | (1+2와 중복, 선택) |
| 4 | 403 즉시 중단 분기 | `fetch_phase1.py:96-106` | quota 보존 |
| 5 | Niche/CPM venv DLL 재생성 | `backend/.venv/` | 부활 (4번 후) |

**이상 진단 종료. 모든 수정은 사용자 컨펌 대기.**
