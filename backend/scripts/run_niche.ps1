# ViralBoard Track 4 — Niche Keyword Fetcher 래퍼
# Windows 작업 스케줄러: 매일 03:00

$ErrorActionPreference = "Continue"
$PSDefaultParameterValues['Add-Content:Encoding'] = 'UTF8'
$PSDefaultParameterValues['Out-File:Encoding']    = 'UTF8'
$OutputEncoding          = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectPath = "C:\Ai_Wiki\viralboard"
$LogDir      = "$ProjectPath\backend\logs"
$LogFile     = "$LogDir\niche_$(Get-Date -Format 'yyyy-MM-dd').log"
$PythonExe   = "$ProjectPath\backend\.venv\Scripts\python.exe"
$ScriptPath  = "$ProjectPath\backend\scripts\fetch_niche_channels.py"

# G1.5.4: telegram alert helper
$envFile = "$ProjectPath\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match "^(TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID)=(.+)$" } | ForEach-Object {
        Set-Item -Path "env:$($Matches[1])" -Value $Matches[2].Trim()
    }
}
function Send-TgAlert($msg) {
    if (-not $env:TELEGRAM_BOT_TOKEN -or -not $env:TELEGRAM_CHAT_ID) { return }
    try {
        $body = @{ chat_id = $env:TELEGRAM_CHAT_ID; text = $msg } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "https://api.telegram.org/bot$env:TELEGRAM_BOT_TOKEN/sendMessage" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop | Out-Null
    } catch { Add-Content -Path $LogFile -Value "[WARN] tg alert failed: $($_.Exception.Message)" }
}

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

Add-Content -Path $LogFile -Value "=== $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') 시작 ==="

try {
    $env:PYTHONIOENCODING = 'utf-8'
    $output = & $PythonExe $ScriptPath 2>&1
    Add-Content -Path $LogFile -Value $output
    $exitCode = $LASTEXITCODE
    Add-Content -Path $LogFile -Value "=== exit code: $exitCode ==="
} catch {
    Add-Content -Path $LogFile -Value "[FATAL] $($_.Exception.Message)"
    Send-TgAlert "[VBoard TS FAIL] run_niche.ps1 exception: $($_.Exception.Message) @ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    exit 1
}

if ($exitCode -ne 0) {
    Send-TgAlert "[VBoard TS FAIL] run_niche.ps1 exit=$exitCode @ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

exit $exitCode
