# Fix file2 references
with open(r'c:\Users\admin\.gemini\antigravity\SCRATCH2\community\inquiry.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove line 411 (index 410) that contains inquiry_file2
new_lines = [line for line in lines if 'inquiry_file2' not in line]

with open(r'c:\Users\admin\.gemini\antigravity\SCRATCH2\community\inquiry.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed inquiry.html - removed inquiry_file2 reference")
