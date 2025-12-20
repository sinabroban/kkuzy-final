import os

target_files = [
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\inquiry.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\notice.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\community\review.html",
    r"c:\Users\admin\.gemini\antigravity\SCRATCH2\admin\admin.html"
]

def convert_to_utf8(file_path):
    print(f"Processing: {os.path.basename(file_path)}")
    content = None
    
    # Try UTF-8 first
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        print(" - Already valid UTF-8.")
        # We still overwrite to ensure line endings or BOM are standard if needed, but mostly fine.
    except UnicodeDecodeError:
        print(" - UTF-8 decode failed. Trying CP949...")
        try:
            with open(file_path, 'r', encoding='cp949') as f:
                content = f.read()
            print(" - Detected CP949. Will convert to UTF-8.")
        except UnicodeDecodeError:
            print(" - CP949 decode failed. Trying EUC-KR...")
            try:
                with open(file_path, 'r', encoding='euc-kr') as f:
                    content = f.read()
                print(" - Detected EUC-KR. Will convert to UTF-8.")
            except Exception as e:
                print(f" - Failed to decode: {e}")
                return

    if content is not None:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(" - Successfully saved as UTF-8.")
        except Exception as e:
            print(f" - Failed to write: {e}")

if __name__ == "__main__":
    for file_path in target_files:
        if os.path.exists(file_path):
            convert_to_utf8(file_path)
        else:
            print(f"File not found: {file_path}")
