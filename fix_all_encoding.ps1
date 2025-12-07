# 모든 HTML 파일의 인코딩 문제를 해결하는 스크립트
# index.html의 정상적인 한글 텍스트를 기반으로 하위 페이지 수정

$ErrorActionPreference = "Stop"
$baseDir = "C:\Users\admin\.gemini\antigravity\SCRATCH2"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "HTML 파일 한글 인코딩 복구 작업 시작" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 수정할 파일 목록
$filesToFix = @(
    "pages\sub02_2.html",
    "pages\dealership.html",
    "pages\privacy.html",
    "pages\project_100.html",
    "products\beverage.html",
    "products\food.html",
    "products\list.html",
    "products\medicine.html",
    "products\sesim_gwitteumbong.html",
    "products\skin.html",
    "community\faq.html",
    "community\inquiry.html",
    "community\notice.html",
    "community\testimonials.html",
    "story\story.html",
    "gallery\farm.html",
    "gallery\micro.html",
    "shop\list.html"
)

# 한글 텍스트 매핑 (깨진 텍스트 -> 정상 텍스트)
$replacements = @{
    # 메뉴 텍스트
    "占쏙옙품占싫놂옙"                                                        = "상품안내"
    "회占쏙옙柰占?"                                                         = "회사소개"
    "占쏙옙占쏙옙占쏙옙占싱야깍옙"                                                  = "꾸지뽕이야기"
    "占쏙옙占심귀띰옙占?"                                                      = "세심귀뜸봉"
    "체占쏙옙占쏙옙占싶븝옙"                                                     = "체험인터뷰"
    "占쏙옙占썲갤占쏙옙占쏙옙"                                                    = "농장갤러리"
    "커占승댐옙티"                                                          = "커뮤니티"
    "占쏙옙占쏙옙占쏙옙占쏙옙"                                                    = "공지사항"
    "占쏙옙占쏙옙"                                                          = "문의"
    
    # 로고 및 회사명
    "占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙"                                                 = "대전꾸지뽕"
    "占쏙옙占쏙옙 占쏙옙占쏘동 占쏙옙占싫몌옙占쏙옙占쏙옙 占쏙옙占쏙옙占쏙옙 占쏙옙占쏙옙占?"                  = "대전 괴곡동 농업회사법인 꾸지뽕 사업단"
    "占쏙옙占쏙옙占싶삼옙占쏙옙占?"                                                 = "꾸지뽕사업단"
    
    # 퀵메뉴
    "占쏙옙占쏙옙/占쌍뱄옙"                                                     = "톡상담/주문"
    "占쌍깍옙 占쏙옙"                                                        = "최근 본"
    "占쏙옙품"                                                            = "상품"
    "占쏙옙占쏙옙占쏙옙占쏙옙"                                                    = "내역없음"
    "占쏙옙占쏙옙占쏙옙"                                                       = "맨위로"
    
    # 푸터 텍스트
    "占쏙옙占쏙옙占쏙옙 占쏙옙품占싫놂옙"                                              = "꾸지뽕 상품안내"
    "占쏙옙占쏙옙占쏙옙占쏙옙처占쏙옙占쏙옙침"                                            = "개인정보처리지침"
    "占쌔븝옙占쏙옙占쌉니댐옙"                                                    = "준비중입니다"
    
    # 회사 정보
    "占쏙옙호占쏙옙"                                                         = "상호명"
    "占쏙옙표占쏙옙"                                                         = "대표자"
    "占썼선占쏙옙"                                                          = "김선몽"
    "占쏙옙 占쏙옙"                                                         = "주 소"
    "占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙 占쏙옙占쏙옙 占쏙옙占쏘동 28"                                = "대전광역시 서구 괴곡동 28"
    "占쏙옙占쏙옙湄占싹뱄옙호"                                                    = "사업자등록번호"
    "占쏙옙占쏙옙퓔탐키占쏙옙호"                                                   = "통신판매신고번호"
    "占쏙옙 2025-占쏙옙占쏙옙占쏙옙占쏙옙-00061 호"                                   = "제 2025-대전서구-00061 호"
    "占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙책占쏙옙占쏙옙"                                       = "개인정보관리책임자"
    "특占쏙옙,占쎈량占쏙옙占쏙옙"                                                  = "판매,제휴문의"
    "占쏘영占시곤옙"                                                         = "운영시간"
    "占쏙옙占쏙옙"                                                          = "평일"
    "占쏙옙占쏙옙占?"                                                        = "토요일"
    "占쏙옙占심시곤옙"                                                        = "점심시간"
    "占쏙옙占쏙옙占쏙옙占?"                                                     = "고객센터"
    "占쏙옙占쏙옙占?占쏙옙占쏙옙"                                                  = "휴일, 주말"
    "占쌨뱄옙"                                                            = "휴무"
    "占쏙옙占쏙옙"                                                          = "농협"
    "占쏙옙占쏙옙占쏙옙"                                                       = "예금주"
    "占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙幷占실?"                                             = "꾸지봉사업단법인"
    "占쏙옙占시는깍옙"                                                        = "오시는길"
    "占쏙옙占시는깍옙 占쏙옙占쏙옙"                                                 = "오시는길 지도"
    "占쏙옙占싫몌옙占쏙옙占쏙옙 占쏙옙占쏙옙占싶삼옙占쏙옙占쏙옙占?占쏙옙占쏙옙占쏙옙 占쏙옙품占쏙옙占쏙옙 占쏙옙占쏙옙爛求占?" = "농업회사법인 꾸지뽕사업단은 정직한 상품만을 취급합니다"
    
    # Hero Section
    "?�사?�개"                                                          = "회사소개"
    "건강???�을 ?�한 ?�속"                                                 = "건강한 삶을 위한 지속"
    "?�??꾸�?�??�업?�입?�다"                                              = "대전 꾸지뽕 사업단입니다"
    "?�업???�개 준비중?�니??"                                               = "회사소개 준비중입니다"
    "보다 ?�찬 ?�용?�로 찾아뵙겠?�니??"                                         = "보다 풍부한 내용으로 찾아뵙겠습니다"
    
    # 기타
    "占쏙옙占쏙옙占쏙옙 Story"                                                 = "괴곡동 이야기 Story"
    "占싫놂옙占싹십니깍옙"                                                      = "안녕하십니까"
}

foreach ($file in $filesToFix) {
    $filePath = Join-Path $baseDir $file
    
    if (-not (Test-Path $filePath)) {
        Write-Host "파일을 찾을 수 없음: $file" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "처리 중: $file" -ForegroundColor White
    
    try {
        # UTF-8로 파일 읽기
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # 모든 매핑된 텍스트 교체
        foreach ($key in $replacements.Keys) {
            $content = $content -replace [regex]::Escape($key), $replacements[$key]
        }
        
        # UTF-8 BOM 없이 저장
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)
        
        Write-Host "  ✓ 완료" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ 오류: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "작업 완료!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
