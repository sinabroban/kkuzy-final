import os
import chardet

target_files = [
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\inquiry.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\notice.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\review.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\admin\admin.html"
]

def convert_to_utf8(file_path):
    try:
        # Read as binary to detect encoding
        with open(file_path, 'rb') as f:
            raw_data = f.read()
            result = chardet.detect(raw_data)
            encoding = result['encoding']
            confidence = result['confidence']

        print(f"File: {os.path.basename(file_path)}, Detected: {encoding} ({confidence})")

        if encoding.lower() == 'utf-8':
            print(" - Already UTF-8. Skipping (but will ensure no BOM if prefered, or force save to be sure).")
            # Just to be safe, read and write back as utf-8
            content = raw_data.decode('utf-8')
        elif encoding.lower() in ['euc-kr', 'cp949', 'ks_c_5601-1987']:
            print(" - Converting from EUC-KR/CP949 to UTF-8...")
            content = raw_data.decode(encoding)
        else:
            print(f" - Trying to decode with {encoding}...")
            content = raw_data.decode(encoding)

        # Write back as UTF-8
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(" - Saved as UTF-8.")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    for file_path in target_files:
        if os.path.exists(file_path):
            convert_to_utf8(file_path)
        else:
            print(f"File not found: {file_path}")
