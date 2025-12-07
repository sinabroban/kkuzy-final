# -*- coding: utf-8 -*-
import os
import codecs

base_dir = r"C:\Users\admin\.gemini\antigravity\SCRATCH2"

# 수정할 파일 목록
files_to_fix = [
    r"pages\sub02_2.html",
    r"pages\dealership.html",
    r"pages\privacy.html",
    r"pages\project_100.html",
    r"products\beverage.html",
    r"products\food.html",
    r"products\list.html",
    r"products\medicine.html",
    r"products\sesim_gwitteumbong.html",
    r"products\skin.html",
    r"community\faq.html",
    r"community\inquiry.html",
    r"community\notice.html",
    r"community\testimonials.html",
    r"story\story.html",
    r"gallery\farm.html",
    r"gallery\micro.html",
    r"shop\list.html"
]

# 한글 텍스트 매핑
replacements = {
    # 메뉴
    "占쏙옙품占싫놂옙": "상품안내",
    "회占쏙옙柰占?": "회사소개",
    "占쏙옙占쏙옙占쏙옙占싱야깍옙": "꾸지뽕이야기",
    "占쏙옙占심귀띰옙占?": "세심귀뜸봉",
    "체占쏙옙占쏙옙占싶븝옙": "체험인터뷰",
    "占쏙옙占썲갤占쏙옙占쏙옙": "농장갤러리",
    "커占승댐옙티": "커뮤니티",
    "占쏙옙占쏙옙占쏙옙占쏙옙": "공지사항",
    "占쏙옙占쏙옙": "문의",
    
    # 로고
    "占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙": "대전꾸지뽕",
    "占쏙옙占쏙옙 占쏙옙占쏘동 占쏙옙占싫몌옙占쏙옙占쏙옙 占쏙옙占쏙옙占쏙옙 占쏙옙占쏙옙占?": "대전 괴곡동 농업회사법인 꾸지뽕 사업단",
    "占쏙옙占쏙옙占싶삼옙占쏙옙占?": "꾸지뽕사업단",
    
    # 퀵메뉴
    "占쏙옙占쏙옙/占쌍뱄옙": "톡상담/주문",
    "占쌍깍옙 占쏙옙": "최근 본",
    "占쏙옙품": "상품",
    "占쏙옙占쏙옙占쏙옙占쏙옙": "내역없음",
    "占쏙옙占쏙옙占쏙옙": "맨위로",
    
    # 푸터
    "占쏙옙占쏙옙占쏙옙 占쏙옙품占싫놂옙": "꾸지뽕 상품안내",
    "占쏙옙占쏙옙占쏙옙占쏙옙처占쏙옙占쏙옙침": "개인정보처리지침",
    "占쌔븝옙占쏙옙占쌉니댐옙": "준비중입니다",
    
    # 회사정보
    "占쏙옙호占쏙옙": "상호명",
    "占쏙옙표占쏙옙": "대표자",
    "占썼선占쏙옙": "김선몽",
    "占쏙옙 占쏙옙": "주 소",
    "占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙 占쏙옙占쏙옙 占쏙옙占쏘동 28": "대전광역시 서구 괴곡동 28",
    "占쏙옙占쏙옙湄占싹뱄옙호": "사업자등록번호",
    "占쏙옙占쏙옙퓔탐키占쏙옙호": "통신판매신고번호",
    "占쏙옙 2025-占쏙옙占쏙옙占쏙옙占쏙옙-00061 호": "제 2025-대전서구-00061 호",
    "占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙책占쏙옙占쏙옙": "개인정보관리책임자",
    "특占쏙옙,占쎈량占쏙옙占쏙옙": "판매,제휴문의",
    "占쏘영占시곤옙": "운영시간",
    "占쏙옙占쏙옙": "평일",
    "占쏙옙占쏙옙占?": "토요일",
    "占쏙옙占심시곤옙": "점심시간",
    "占쏙옙占쏙옙占쏙옙占?": "고객센터",
    "占쏙옙占쏙옙占?占쏙옙占쏙옙": "휴일, 주말",
    "占쌨뱄옙": "휴무",
    "占쏙옙占쏙옙": "농협",
    "占쏙옙占쏙옙占쏙옙": "예금주",
    "占쏙옙占쏙옙占쏙옙占쏙옙占쏙옙幷占실?": "꾸지봉사업단법인",
    "占쏙옙占시는깍옙": "오시는길",
    "占쏙옙占시는깍옙 占쏙옙占쏙옙": "오시는길 지도",
    "占쏙옙占싫몌옙占쏙옙占쏙옙 占쏙옙占쏙옙占싶삼옙占쏙옙占쏙옙占?占쏙옙占쏙옙占쏙옙 占쏙옙품占쏙옙占쏙옙 占쏙옙占쏙옙爛求占?": "농업회사법인 꾸지뽕사업단은 정직한 상품만을 취급합니다",
}

print("=" * 60)
print("HTML 파일 한글 인코딩 복구 작업 시작")
print("=" * 60)
print()

for file_path in files_to_fix:
    full_path = os.path.join(base_dir, file_path)
    
    if not os.path.exists(full_path):
        print(f"파일을 찾을 수 없음: {file_path}")
        continue
    
    print(f"처리 중: {file_path}")
    
    try:
        # UTF-8로 파일 읽기
        with codecs.open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 모든 매핑된 텍스트 교체
        for old_text, new_text in replacements.items():
            content = content.replace(old_text, new_text)
        
        # UTF-8 BOM 없이 저장
        with codecs.open(full_path, 'w', encoding='utf-8-sig') as f:
            f.write(content)
        
        print(f"  ✓ 완료")
    except Exception as e:
        print(f"  ✗ 오류: {e}")

print()
print("=" * 60)
print("작업 완료!")
print("=" * 60)
