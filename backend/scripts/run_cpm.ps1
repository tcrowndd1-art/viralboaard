# ViralBoard Track 2 — CPM Channel Fetcher 래퍼
# Windows 작업 스케줄러: 매일 04:00

$ErrorActionPreference = "Continue"
$PSDefaultParameterValues['Add-Content:Encoding'] = 'UTF8'
$PSDefaultParameterValues['Out-File:Encoding']    = 'UTF8'
$OutputEncoding          = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectPath = "C:\Ai_Wiki\viralboard"
$LogDir      = "$ProjectPath\backend\logs"
$LogFile     = "$LogDir\cpm_$(Get-Date -Format 'yyyy-MM-dd').log"
$PythonExe   = "$ProjectPath\backend\.venv\Scripts\python.exe"
$ScriptPath  = "$ProjectPath\backend\scripts\fetch_cpm_channels.py"

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
    exit 1
}

exit $exitCode
