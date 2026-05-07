# ViralBoard 신선도 트랙 전용 실행 래퍼 (1시간마다)
$ErrorActionPreference = "Continue"
$PSDefaultParameterValues['Out-File:Encoding'] = 'UTF8'
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectPath = "C:\Ai_Wiki\viralboard"
$LogDir = "$ProjectPath\backend\logs"
$LogFile = "$LogDir\fresh_$(Get-Date -Format 'yyyy-MM-dd').log"
$PythonExe = "$ProjectPath\backend\.venv\Scripts\python.exe"
$ScriptPath = "$ProjectPath\backend\scripts\fetch_phase1.py"

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

Add-Content -Path $LogFile -Value "=== $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') 신선도 트랙 시작 ==="

try {
    $env:PYTHONIOENCODING = 'utf-8'
    $output = & $PythonExe $ScriptPath --fresh-only 2>&1
    Add-Content -Path $LogFile -Value $output
    Add-Content -Path $LogFile -Value "=== exit code: $LASTEXITCODE ==="
} catch {
    Add-Content -Path $LogFile -Value "[FATAL] $($_.Exception.Message)"
    exit 1
}