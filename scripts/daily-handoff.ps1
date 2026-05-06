# 데일리 인계 파일 자동 생성
$date = Get-Date -Format "yyyy-MM-dd"
$filepath = "docs/daily/DAILY-$date.md"
$template = "docs/daily/_TEMPLATE.md"

if (Test-Path $filepath) {
    Write-Host "이미 존재: $filepath"
    exit 0
}

$content = Get-Content $template -Raw
$content = $content -replace "YYYY-MM-DD", $date
Set-Content -Path $filepath -Value $content -Encoding UTF8
Write-Host "생성 완료: $filepath"
