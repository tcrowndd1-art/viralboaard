# 관리자 PowerShell에서 실행
$xmlPath = "$PSScriptRoot\register_task.xml"
schtasks /create /tn "ViralBoard_TitleArchive" /xml $xmlPath /f
schtasks /query /tn "ViralBoard_TitleArchive" /fo LIST
