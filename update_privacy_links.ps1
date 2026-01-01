$files = Get-ChildItem -Path . -Filter *.html -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $oldPattern = "javascript:alert\('준비중입니다\.'\);"
    
    # Determine correct path based on file location
    $relativePath = $file.DirectoryName.Replace((Get-Location).Path, "").TrimStart('\')
    
    if ($relativePath -eq "") {
        # Root level (index.html)
        $newLink = "pages/privacy.html"
    }
    elseif ($relativePath -match "^admin") {
        $newLink = "../pages/privacy.html"
    }
    else {
        $newLink = "../pages/privacy.html"
    }
    
    if ($content -match $oldPattern) {
        $newContent = $content -replace $oldPattern, $newLink
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.Name)" -Fore Green
    }
}

Write-Host "`nAll privacy policy links updated!" -ForegroundColor Cyan
