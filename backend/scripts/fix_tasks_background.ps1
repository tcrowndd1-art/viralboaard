Write-Host "=== ViralBoard Task Background Mode Fix ===" -ForegroundColor Cyan

$principal = New-ScheduledTaskPrincipal -UserId "ADMIN" -LogonType S4U -RunLevel Highest

foreach ($item in @(
    @{ Name="ViralBoard_Fetcher"; Minutes=10  },
    @{ Name="ViralBoard_Fresh";   Minutes=30  },
    @{ Name="ViralBoard_CPM";     Minutes=120 }
)) {
    try {
        $task = Get-ScheduledTask -TaskName $item.Name -ErrorAction Stop
        $task.Settings.DisallowStartIfOnBatteries = $false
        $task.Settings.StopIfGoingOnBatteries     = $false
        $task.Settings.ExecutionTimeLimit          = "PT$($item.Minutes)M"
        $task.Principal.LogonType                  = "S4U"
        $task.Principal.RunLevel                   = "Highest"
        $task | Set-ScheduledTask -ErrorAction Stop
        Write-Host "  OK $($item.Name)" -ForegroundColor Green
    } catch {
        Write-Host "  FAIL $($item.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 확인 ===" -ForegroundColor Cyan
foreach ($name in @("ViralBoard_Fetcher","ViralBoard_Fresh","ViralBoard_CPM")) {
    Write-Host "[$name]" -ForegroundColor Yellow
    schtasks /query /fo LIST /v /tn $name | Select-String "Logon Mode|Power Management"
}
