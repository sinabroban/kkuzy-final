import os
import glob

# Files to check/convert
files = [
    'products/kkuzy_soap.html',
    'products/kkuzy_gift.html',
    'products/kkuzy_tea.html',
    'products/kkuzy_original.html',
    'products/kkuzy_extract.html'
]

base_dir = r"c:\Users\admin\.gemini\antigravity\SCRATCH2"

for fname in files:
    fpath = os.path.join(base_dir, fname)
    if not os.path.exists(fpath):
        print(f"Skipping {fname} (not found)")
        continue

    try:
        # Try reading as CP949 (EUC-KR)
        with open(fpath, 'r', encoding='cp949') as f:
            content = f.read()
        
        # If successful, write back as UTF-8
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Converted {fname} from CP949 to UTF-8")
        
    except UnicodeDecodeError:
        print(f"Failed to decode {fname} as CP949. It might be already UTF-8 or another encoding.")
    except Exception as e:
        print(f"Error processing {fname}: {e}")
