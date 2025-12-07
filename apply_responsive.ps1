# 반응형 웹 설정 자동 적용 PowerShell 스크립트

$baseDir = "C:\Users\admin\.gemini\antigravity\SCRATCH2"
$excludeFiles = @("index.html")  # 이미 수정됨

# HTML 파일 목록
$htmlFiles = @(
    "pages\sub02_2.html",
    "pages\dealership.html",
    "pages\privacy.html",
    "pages\project_100.html",
    "products\beverage.html",
    "products\food.html",
    "products\medicine.html",
    "products\sesim_gwitteumbong.html",
    "products\skin.html",
    "products\list.html",
    "community\faq.html",
    "community\inquiry.html",
    "community\notice.html",
    "community\testimonials.html",
    "story\story.html",
    "gallery\farm.html",
    "gallery\micro.html",
    "shop\list.html"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "반응형 웹 설정 자동 적용 스크립트" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$updatedCount = 0
$totalFiles = $htmlFiles.Count

foreach ($file in $htmlFiles) {
    $filePath = Join-Path $baseDir $file
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠ 파일 없음: $file" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "📄 처리 중: $file" -ForegroundColor White
    
    try {
        # UTF-8로 파일 읽기
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        $originalContent = $content
        
        # 상대 경로 계산
        $depth = ($file -split '\\').Count - 1
        $relPath = if ($depth -gt 0) { "../" * $depth } else { "./" }
        
        # 1. viewport 메타 태그 변경
        $newViewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">'
        $content = $content -replace '<meta\s+name="viewport"\s+content="[^"]*">', $newViewport
        Write-Host "  ✓ Viewport 업데이트" -ForegroundColor Green
        
        # 2. responsive.css 추가 (style.css 다음에)
        if ($content -notmatch 'responsive\.css') {
            $responsiveCss = "`t<link rel=`"stylesheet`" href=`"${relPath}css/responsive.css`" type=`"text/css`">"
            $content = $content -replace '(<link\s+rel="stylesheet"\s+href="[^"]*style\.css"[^>]*>)', "`$1`r`n$responsiveCss"
            Write-Host "  ✓ responsive.css 추가" -ForegroundColor Green
        }
        
        # 3. responsive.js 추가 (common.js 다음에)
        if ($content -notmatch 'responsive\.js') {
            $responsiveJs = "`t<script type=`"text/javascript`" src=`"${relPath}js/responsive.js`"></script>"
            $content = $content -replace '(<script\s+type="text/javascript"\s+src="[^"]*common\.js"[^>]*></script>)', "`$1`r`n$responsiveJs"
            Write-Host "  ✓ responsive.js 추가" -ForegroundColor Green
        }
        
        # 변경사항이 있으면 저장
        if ($content -ne $originalContent) {
            $content | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
            $updatedCount++
            Write-Host "  ✅ 저장 완료" -ForegroundColor Green
        } else {
            Write-Host "  - 변경사항 없음" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "  ✗ 오류: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ 완료: $updatedCount/$totalFiles 파일 업데이트됨" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. 브라우저에서 각 페이지 확인" -ForegroundColor White
Write-Host "2. 모바일 시뮬레이션 테스트" -ForegroundColor White
Write-Host "3. 문제가 있으면 개별 파일 수정" -ForegroundColor White
Write-Host ""
