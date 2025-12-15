
import os

files_to_update = [
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\shop\list.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\products\sesim_gwitteumbong.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\products\kkuzy_tea.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\products\kkuzy_soap.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\products\kkuzy_original.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\products\kkuzy_gift.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\products\kkuzy_extract.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\index.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\pages\dealership.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\notice.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\review.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\inquiry.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\testimonials.html", 
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\pages\sub02_2.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\gallery\farm.html"
]

target_text = "구매후기"
replacement_text = "사용후기"

for file_path in files_to_update:
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if target_text in content:
                new_content = content.replace(target_text, replacement_text)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {file_path}")
            else:
                print(f"Skipped (text not found): {file_path}")
                
        except Exception as e:
            print(f"Error updating {file_path}: {e}")
    else:
        print(f"File not found: {file_path}")
