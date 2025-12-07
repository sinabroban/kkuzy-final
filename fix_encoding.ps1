# 전체 HTML 파일의 인코딩 문제 해결 스크립트

$baseDir = "C:\Users\admin\.gemini\antigravity\SCRATCH2"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "HTML 파일 인코딩 확인 및 수정" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 모든 HTML 파일 찾기
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse | Where-Object { $_.FullName -notlike "*\.git*" }

Write-Host "총 $($htmlFiles.Count)개의 HTML 파일 발견" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Replace($baseDir + "\", "")
    Write-Host "처리 중: $relativePath" -ForegroundColor White
    
    try {
        # UTF-8 BOM 없이 읽기
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        
        # UTF-8 BOM 없이 저장
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        
        Write-Host "  ✓ 인코딩 확인 완료" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ 오류: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "완료!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
