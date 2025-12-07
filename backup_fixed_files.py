
import os
import shutil
from datetime import datetime

# Source Directory (Current Workspace)
source_dir = r'c:\Users\admin\.gemini\antigravity\SCRATCH2'

# Destination Directory (Backup)
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_dir = os.path.join(source_dir, f'DEPLOY_READY_{timestamp}')

os.makedirs(backup_dir, exist_ok=True)

# Files to Backup (The ones we fixed + index)
files_to_backup = [
    'index.html',
    'pages/sub02_2.html',
    'story/story.html',
    'gallery/farm.html',
    'products/sesim_gwitteumbong.html',
    'community/testimonials.html',
    'css/style.css', # Important style files
    'css/responsive.css',
    'js/common.js',
    'js/responsive.js'
]

print(f"Backing up files to: {backup_dir}")

for file_rel_path in files_to_backup:
    src_file = os.path.join(source_dir, file_rel_path.replace('/', '\\'))
    dst_file = os.path.join(backup_dir, file_rel_path.replace('/', '\\'))
    
    # Create parent dirs in backup if needed
    os.makedirs(os.path.dirname(dst_file), exist_ok=True)
    
    if os.path.exists(src_file):
        shutil.copy2(src_file, dst_file)
        print(f"Copied: {file_rel_path}")
    else:
        print(f"Warning: Source file not found: {file_rel_path}")

print("Backup complete.")
