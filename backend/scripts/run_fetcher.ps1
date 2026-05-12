# ViralBoard Fetcher 실행 래퍼
# Windows 작업 스케줄러가 이 스크립트 호출

$ErrorActionPreference = "Continue"

# UTF-8 전역 통일 (한글 Mojibake 방지)
$PSDefaultParameterValues['Add-Content:Encoding'] = 'UTF8'
$PSDefaultParameterValues['Out-File:Encoding'] = 'UTF8'
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectPath = "C:\Ai_Wiki\viralboard"
$LogDir = "$ProjectPath\backend\logs"
$LogFile = "$LogDir\fetcher_$(Get-Date -Format 'yyyy-MM-dd').log"
$PythonExe = "$ProjectPath\backend\.venv\Scripts\python.exe"
$ScriptPath = "$ProjectPath\backend\scripts\fetch_phase1.py"

# G1.5.4: .env에서 텔레그램 토큰 로드 (실패 알림용)
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

# 로그 디렉토리 확인
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# 시작 로그
Add-Content -Path $LogFile -Value "=== $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') 시작 ==="

# 실행
try {
    $env:PYTHONIOENCODING = 'utf-8'
    $output = & $PythonExe $ScriptPath 2>&1
    Add-Content -Path $LogFile -Value $output
    $exitCode = $LASTEXITCODE
    Add-Content -Path $LogFile -Value "=== exit code: $exitCode ==="
} catch {
    Add-Content -Path $LogFile -Value "[FATAL] $($_.Exception.Message)"
    Send-TgAlert "[VBoard TS FAIL] run_fetcher.ps1 exception: $($_.Exception.Message) @ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    exit 1
}

if ($exitCode -ne 0) {
    Send-TgAlert "[VBoard TS FAIL] run_fetcher.ps1 exit=$exitCode @ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

exit $exitCode
