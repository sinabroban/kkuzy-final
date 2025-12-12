$files = @(
    "shop/list.html",
    "story/story.html",
    "products/skin.html",
    "pages/sub02_2.html",
    "pages/project_100.html",
    "products/sesim_gwitteumbong.html",
    "products/medicine.html",
    "products/list.html",
    "pages/dealership.html",
    "products/food.html",
    "products/beverage.html",
    "gallery/micro.html",
    "company/intro.html",
    "company/corporate.html",
    "gallery/farm.html",
    "community/testimonials.html",
    "community/notice.html",
    "community/inquiry.html",
    "community/faq.html"
)

foreach ($file in $files) {
    $path = "c:\Users\admin\.gemini\antigravity\SCRATCH2\$file"
    if (Test-Path $path) {
        $content = Get-Content -Path $path -Raw -Encoding UTF8
        # Replace main logo
        $content = $content -replace 'src="\.\./images/logo_new\.jpg"', 'src="../images/logo_v2.jpg"'
        # Replace sticky logo and add style
        $content = $content -replace 'src="\.\./images/logo_on\.png"', 'src="../images/logo_v2.jpg" style="height: 40px; width: auto;"'
        
        Set-Content -Path $path -Value $content -Encoding UTF8
        Write-Host "Updated $file"
    }
    else {
        Write-Host "File not found: $file"
    }
}
