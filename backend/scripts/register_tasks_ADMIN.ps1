# ViralBoard 작업 스케줄러 등록 스크립트
# 반드시 PowerShell을 "관리자 권한으로 실행" 후 실행할 것
#
# 사용법:
#   powershell -ExecutionPolicy Bypass -File register_tasks_ADMIN.ps1

$PsExe       = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
$ProjectPath = "C:\Ai_Wiki\viralboard"

# ── Task 1: ViralBoard_Niche (매일 03:00) ──────────────────────────
$triggerN = New-ScheduledTaskTrigger -Daily -At "03:00"
$actionN  = New-ScheduledTaskAction -Execute $PsExe `
    -Argument "-NonInteractive -ExecutionPolicy Bypass -File `"$ProjectPath\backend\scripts\run_niche.ps1`""
$settN    = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 2) -StartWhenAvailable

if (Get-ScheduledTask -TaskName "ViralBoard_Niche" -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName "ViralBoard_Niche" -Confirm:$false
}
Register-ScheduledTask `
    -TaskName "ViralBoard_Niche" `
    -Trigger $triggerN `
    -Action $actionN `
    -Settings $settN `
    -RunLevel Highest `
    -Force
Write-Host "[OK] ViralBoard_Niche 등록 완료 (매일 03:00)"

# ── Task 2: ViralBoard_CPM (매일 04:00) ────────────────────────────
$triggerC = New-ScheduledTaskTrigger -Daily -At "04:00"
$actionC  = New-ScheduledTaskAction -Execute $PsExe `
    -Argument "-NonInteractive -ExecutionPolicy Bypass -File `"$ProjectPath\backend\scripts\run_cpm.ps1`""
$settC    = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 2) -StartWhenAvailable

if (Get-ScheduledTask -TaskName "ViralBoard_CPM" -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName "ViralBoard_CPM" -Confirm:$false
}
Register-ScheduledTask `
    -TaskName "ViralBoard_CPM" `
    -Trigger $triggerC `
    -Action $actionC `
    -Settings $settC `
    -RunLevel Highest `
    -Force
Write-Host "[OK] ViralBoard_CPM 등록 완료 (매일 04:00)"

# ── 확인 ───────────────────────────────────────────────────────────
Get-ScheduledTask | Where-Object { $_.TaskName -like "ViralBoard*" } |
    Select-Object TaskName, State
