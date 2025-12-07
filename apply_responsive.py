#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
반응형 웹 설정 자동 적용 스크립트
모든 HTML 파일에 반응형 viewport와 CSS/JS 링크를 추가합니다.
"""

import os
import re
from pathlib import Path

# 작업 디렉토리
BASE_DIR = Path(__file__).parent

# 제외할 디렉토리
EXCLUDE_DIRS = {'.git', '.agent', 'node_modules', '__pycache__'}

# 제외할 파일
EXCLUDE_FILES = {'index.html'}  # 이미 수정됨

def find_html_files(base_dir):
    """모든 HTML 파일 찾기"""
    html_files = []
    
    for root, dirs, files in os.walk(base_dir):
        # 제외 디렉토리 필터링
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if file.endswith('.html') and file not in EXCLUDE_FILES:
                html_files.append(Path(root) / file)
    
    return html_files

def get_relative_path_depth(file_path, base_dir):
    """파일의 상대 경로 깊이 계산"""
    rel_path = file_path.relative_to(base_dir)
    depth = len(rel_path.parts) - 1
    return '../' * depth if depth > 0 else './'

def update_html_file(file_path, base_dir):
    """HTML 파일 업데이트"""
    try:
        # UTF-8로 파일 읽기
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 상대 경로 계산
        rel_path = get_relative_path_depth(file_path, base_dir)
        
        # 1. viewport 메타 태그 변경
        # 기존 viewport 찾기
        viewport_pattern = r'<meta\s+name="viewport"\s+content="[^"]*">'
        new_viewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">'
        
        if re.search(viewport_pattern, content):
            content = re.sub(viewport_pattern, new_viewport, content)
            print(f"  ✓ Viewport 업데이트: {file_path.name}")
        else:
            # viewport가 없으면 head 태그 다음에 추가
            content = re.sub(
                r'(<head[^>]*>)',
                r'\1\n\t' + new_viewport,
                content,
                count=1
            )
            print(f"  ✓ Viewport 추가: {file_path.name}")
        
        # 2. responsive.css 링크 추가 (style.css 다음에)
        responsive_css = f'<link rel="stylesheet" href="{rel_path}css/responsive.css" type="text/css">'
        
        # 이미 responsive.css가 있는지 확인
        if 'responsive.css' not in content:
            # style.css 다음에 추가
            style_css_pattern = r'(<link\s+rel="stylesheet"\s+href="[^"]*style\.css"[^>]*>)'
            if re.search(style_css_pattern, content):
                content = re.sub(
                    style_css_pattern,
                    r'\1\n\t' + responsive_css,
                    content,
                    count=1
                )
                print(f"  ✓ responsive.css 추가: {file_path.name}")
        
        # 3. responsive.js 스크립트 추가 (common.js 다음에)
        responsive_js = f'<script type="text/javascript" src="{rel_path}js/responsive.js"></script>'
        
        # 이미 responsive.js가 있는지 확인
        if 'responsive.js' not in content:
            # common.js 다음에 추가
            common_js_pattern = r'(<script\s+type="text/javascript"\s+src="[^"]*common\.js"[^>]*></script>)'
            if re.search(common_js_pattern, content):
                content = re.sub(
                    common_js_pattern,
                    r'\1\n\t' + responsive_js,
                    content,
                    count=1
                )
                print(f"  ✓ responsive.js 추가: {file_path.name}")
        
        # 변경사항이 있으면 파일 저장
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        else:
            print(f"  - 변경사항 없음: {file_path.name}")
            return False
            
    except Exception as e:
        print(f"  ✗ 오류 발생 ({file_path.name}): {e}")
        return False

def main():
    """메인 함수"""
    print("=" * 60)
    print("반응형 웹 설정 자동 적용 스크립트")
    print("=" * 60)
    print()
    
    # HTML 파일 찾기
    html_files = find_html_files(BASE_DIR)
    print(f"📁 발견된 HTML 파일: {len(html_files)}개")
    print()
    
    # 각 파일 업데이트
    updated_count = 0
    for file_path in html_files:
        rel_path = file_path.relative_to(BASE_DIR)
        print(f"📄 처리 중: {rel_path}")
        
        if update_html_file(file_path, BASE_DIR):
            updated_count += 1
        print()
    
    # 결과 출력
    print("=" * 60)
    print(f"✅ 완료: {updated_count}/{len(html_files)} 파일 업데이트됨")
    print("=" * 60)
    print()
    print("다음 단계:")
    print("1. 브라우저에서 각 페이지 확인")
    print("2. 모바일 시뮬레이션 테스트")
    print("3. 문제가 있으면 개별 파일 수정")
    print()

if __name__ == '__main__':
    main()
