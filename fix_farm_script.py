
import re
import os
import sys

try:
    print("Starting fix_farm_script.py")
    
    # Use relative paths
    ref_path = r'pages\sub02_2.html'
    target_path = r'gallery\farm.html'
    
    if not os.path.exists(ref_path):
        print(f"Error: {ref_path} not found")
        sys.exit(1)
        
    if not os.path.exists(target_path):
        print(f"Error: {target_path} not found")
        sys.exit(1)

    print(f"Reading {ref_path}...")
    with open(ref_path, 'r', encoding='utf-8') as f:
        ref_content = f.read()

    print("Extracting Header...")
    header_match = re.search(r'^(.*?)<div class="subvisual">', ref_content, re.DOTALL)
    if not header_match:
        print("Header match failed")
        sys.exit(1)
    header_html = header_match.group(1)
    header_html = header_html.replace('class="on_menu_active">회사소개</a>', 'class=" ">회사소개</a>')
    header_html = header_html.replace('class=" ">농장갤러리</a>', 'class="on_menu_active">농장갤러리</a>')

    print("Defining Hero...")
    hero_html = '''
            <!-- Hero Section (Subvisual) -->
            <div class="subvisual">
                <div class="subvisual_text01">
                    <h2>
                        <p class="title_text01">
                            <span>농장갤러리</span>
                        </p>
                    </h2>
                    <p class="title_text02">
                        청정 자연 속에서 자라나는<br>
                        꾸지뽕 농장의 풍경을 담았습니다.
                    </p>
                </div>
            </div>
    '''

    print("Extracting Footer...")
    footer_match = re.search(r'(<div id="copy_bt">.*)$', ref_content, re.DOTALL)
    if not footer_match:
        print("Footer match failed")
        sys.exit(1)
    footer_html = footer_match.group(1)

    print(f"Reading {target_path}...")
    with open(target_path, 'r', encoding='utf-8', errors='ignore') as f:
        farm_content = f.read()

    print("Extracting Images...")
    img_pattern = r'src="../images/gallery_update/(.*?)"'
    images = re.findall(img_pattern, farm_content)
    seen = set()
    unique_images = []
    for img in images:
        if img not in seen:
            unique_images.append(img)
            seen.add(img)
            
    print(f"Found {len(unique_images)} images.")

    print("Constructing HTML...")
    body_content = '<div class="subcontent"><div class="subject1" style="padding: 50px 0;">\n'
    body_content += '<div style="width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">\n'

    for i, img_file in enumerate(unique_images):
        body_content += f'''
        <div style="border: 1px solid #ddd; background: #fff; padding: 10px;">
            <div style="overflow: hidden; height: 195px; display: flex; align-items: center; justify-content: center;">
                <a href="../images/gallery_update/{img_file}" target="_blank">
                    <img src="../images/gallery_update/{img_file}" style="max-width: 100%; max-height: 100%; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                </a>
            </div>
            <div style="padding: 15px 0; text-align: center;">
                <p style="color: #333; font-weight: bold; font-size: 16px;">꾸지뽕 농장 풍경</p>
                <p style="color: #888; font-size: 13px; margin-top: 5px;">2024년 농장 모습</p>
            </div>
        </div>
        '''

    body_content += '</div>\n</div></div>\n'
    final_html = header_html + hero_html + body_content + footer_html

    print("Writing file...")
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(final_html)

    print(f"Successfully fixed {target_path}")

except Exception as e:
    print(f"EXCEPTION: {e}")
    sys.exit(1)
