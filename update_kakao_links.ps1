# PowerShell script to update all Kakao chat links
# From: https://open.kakao.com/o/s02JZeUh
# To: https://pf.kakao.com/_AxnVtn/chat

$oldUrl = "https://open.kakao.com/o/s02JZeUh"
$newUrl = "https://pf.kakao.com/_AxnVtn/chat"

# List of all HTML files to update
$files = @(
    "index.html",
    "live_check.html",
    "story\story.html",
    "shop\list.html",
    "products\kkuzy_extract.html",
    "products\kkuzy_gift.html",
    "products\kkuzy_soap.html",
    "products\kkuzy_tea.html",
    "products\kkuzy_original.html",
    "products\sesim_gwitteumbong.html",
    "products\medicine.html",
    "products\skin.html",
    "pages\sesim_gwitteumbong.html",
    "pages\sub02_2.html",
    "pages\project_100.html",
    "gallery\farm.html",
    "company\intro.html",
    "company\corporate.html",
    "community\testimonials.html"
)

$updatedCount = 0
$totalReplacements = 0

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        # Read file content
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Count occurrences
        $matches = ([regex]::Matches($content, [regex]::Escape($oldUrl))).Count
        
        if ($matches -gt 0) {
            # Replace all occurrences
            $newContent = $content -replace [regex]::Escape($oldUrl), $newUrl
            
            # Write back to file
            Set-Content $filePath -Value $newContent -Encoding UTF8 -NoNewline
            
            Write-Host "  ✓ Updated $matches occurrence(s)" -ForegroundColor Green
            $updatedCount++
            $totalReplacements += $matches
        } else {
            Write-Host "  - No occurrences found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Summary:" -ForegroundColor Magenta
Write-Host "  Files updated: $updatedCount / $($files.Count)" -ForegroundColor Green
Write-Host "  Total replacements: $totalReplacements" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
