# ViralBoard Fetcher 실행 래퍼
# Windows 작업 스케줄러가 이 스크립트 호출

$ErrorActionPreference = "Continue"
$ProjectPath = "C:\Ai_Wiki\viralboard"
$LogDir = "$ProjectPath\backend\logs"
$LogFile = "$LogDir\fetcher_$(Get-Date -Format 'yyyy-MM-dd').log"
$PythonExe = "$ProjectPath\backend\.venv\Scripts\python.exe"
$ScriptPath = "$ProjectPath\backend\scripts\fetch_phase1.py"

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
    exit 1
}

exit $exitCode
