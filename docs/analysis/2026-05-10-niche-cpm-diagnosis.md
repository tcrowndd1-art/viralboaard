---
date: 2026-05-10
type: exploration
target: Niche/CPM 자연 부활 진단 (G1.5.1)
priority: high
status: resolved
audited_against: docs/audit/2026-05-10-cycle1-verification.md
---

# G1.5.1 — Niche/CPM 자연 부활 진단

## 발견 (5/10 23시 기준)

### 로그 사이즈 추이
| 작업 | 5/9 로그 | 5/10 로그 | 해석 |
|---|---|---|---|
| Niche | 47 bytes (배너 1줄, 5/9 03:00) | **19,779 bytes** (5/10 03:05 정상 실행) | **부활 ✅** |
| CPM | 7,905 bytes (5/9 04:00 정상) | 7,905 bytes (5/10 04:00 정상) | 5/8 보고서가 misdiagnosis (CPM은 죽은 적 없음) |

### Niche 5/10 실행 내용 (마스킹 OK)
```
=== Track 4 Niche Fetcher 2026-05-10T03:05:17 ===
  20 niches × 5 results
  [cooking] cooking recipe (US): 5건 / 요리 레시피 (KR): 403 / 料理 レシピ (JP): 403
  [mukbang] mukbang (US): 403 / 먹방 (KR): 403 / 먹방 ASMR (KR): 5건
  [asmr] asmr (US): 403 / ASMR (JP): 403 / asmr eating (US): 403
  [fitness] workout at home (US): 403 / 홈트레이닝 (KR): 5건 / 筋トレ (JP): 403
  ...
```

→ **20 niches 모두 시도**, 일부 성공 (cooking US 5건, 먹방 ASMR 5건, 홈트레이닝 5건 등)
→ 다수 403 = mostPopular와 동일 (region × keyword 미지원 조합)

## 5/8 quota-diag 가설 vs 5/10 실측

| 가설 (5/8) | 실측 (5/10) |
|---|---|
| DLL `0xC000013A` = venv 깨짐 | ❌ 반증 (cycle1 G0.2 + 5/10 정상 실행) |
| Niche/CPM 영구 죽음 | ❌ 반증 (5/10 자연 부활) |
| 8.5K unit 절약 중 | ❌ 일시적이었음 |

## 5/9 0xC000013A 진짜 원인 (가설)

`STATUS_CONTROL_C_EXIT` = 외부 종료 신호. 가능 시나리오:
1. **시간 충돌**: ViralBoard_Niche (03:00) ↔ ViralBoard_Fetcher (30분 cron, 03:00 트리거) 동시 실행 → 한 쪽 kill?
2. **PowerShell stop**: 이전 세션 실행 중 (03:00 프로세스 살아있는 상태에서 새 트리거 발생)
3. **Windows Update / 시스템 재시작**: 5/8~5/9 사이 OS 작업 영향

**검증**: 5/10 niche/cpm 로그 정상 = 위 1번 가설이라면 cron 빈도 변경 (G1.5.2 30분 → 1시간) 후 더 안정적.

## P2 진척도 갱신 (master-tracker 후보)

| 시점 | P2 % | 사유 |
|---|---|---|
| cycle1 종료 | 50% | Niche/CPM 죽음 + Fetcher cron 30분 quota |
| cycle2 G1.5.1 (5/10) | **75%+** | Niche/CPM 자연 부활 + cycle1 G2.5/G2.6 효과 |
| cycle2 G1.5.2 후 | **85%+** | Fetcher cron 1시간 정상화 (David 관리자 실행 후) |

## Quota 영향 (재산출)

cycle2 시작 시점 실측 (Phase 0):
- fetcher_2026-05-10.log [SKIP-CACHE] 14건 (cycle1 G2.5 작동)
- 403 폭격 4316건 / 12992 라인 = 33% (cycle1 전 93.5% → 60%p 감소)
- [QUOTA] 0건 (진짜 quota 폭발 X)

→ 현재 **quota 사용 ~14.4K/일 = 한도 70K의 21%**. Niche/CPM 부활 시 + ~8.5K = 23K = 33%. 매우 안전.

## 0905-2차 백로그 항목

- [ ] 시간 충돌 가설 검증 — Windows Event Log 분석 (5/9 03:00 시점 동시 작업)
- [ ] cycle2 G1.5.2 cron 변경 후 Niche 안정성 1주일 모니터링

## 결론

**Niche `-1073741510`는 영구 결함이 아닌 일시적 충돌**. Cycle1에서 의심한 DLL 가설은 폐기. cycle2 G1.5.2 (Fetcher cron 1시간) 적용 시 시간 충돌 가능성 더 감소.
