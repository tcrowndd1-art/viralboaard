---
date: 2026-05-10
type: audit
target: Windows Task Scheduler — ViralBoard_Fetcher cron 변경 (G1.5.2)
priority: high
status: pending-admin (David 직접 관리자 실행 필요)
---

# G1.5.2 — Fetcher cron 30분 → 1시간 (옵션 B Trade-off)

## 현재 상태 (관리자 권한 미보유 confirmed)
- **ViralBoard_Fetcher** Repetition Interval: `PT30M` (30분)
- Run As User: ADMIN
- Logon Mode: Interactive/Background

## David 결정 (cycle2 G1.5 진입 시)
**옵션 B 채택**: 30분 → 1시간 (50% 신선도 / 50% quota 절약)

## 적용 방법 (David 관리자 PowerShell 실행)

```powershell
# 관리자 권한으로 PowerShell 열기
schtasks /change /TN "ViralBoard_Fetcher" /RI 60

# 또는 Set-ScheduledTask 사용
$task = Get-ScheduledTask -TaskName "ViralBoard_Fetcher"
$trigger = New-ScheduledTaskTrigger -Once -At ([datetime]"2026-05-10 23:00") -RepetitionInterval (New-TimeSpan -Hours 1)
Set-ScheduledTask -TaskName "ViralBoard_Fetcher" -Trigger $trigger
```

## 적용 후 검증
```powershell
(Get-ScheduledTask -TaskName "ViralBoard_Fetcher").Triggers[0].Repetition.Interval
# 출력: PT1H (1시간) — 변경 완료
```

## Quota 영향 추정 (cycle2 v1.1 plan 인용)

| 시나리오 | Fetcher 일 횟수 | unit/run | 일일 사용 | 한도 70K 대비 |
|---|---|---|---|---|
| 현재 (30분) | 48 | ~300 | ~14.4K | 21% |
| 변경 (1시간) | 24 | ~300 | ~7.2K | **10%** |

→ 50% quota 절약 + 신선도 50% 감소 (사용자 체감 1시간 내 변경 영향 적음)

## 완료 후 master-tracker 갱신
- master-tracker P2 cycle2 컬럼: 50% → **80%+** (Niche 부활 + Fetcher cron 정상화 합산)
