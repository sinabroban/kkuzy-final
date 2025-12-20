$files = @(
    "community\inquiry.html",
    "community\notice.html",
    "community\review.html",
    "admin\admin.html"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        Write-Host "Converting $f to UTF-8 with BOM..."
        try {
            $content = Get-Content $f -Encoding UTF8
            $content | Set-Content $f -Encoding UTF8
            Write-Host " - Success"
        }
        catch {
            Write-Host " - Error: $_"
        }
    }
    else {
        Write-Host "File not found: $f"
    }
}
