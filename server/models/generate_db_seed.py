import os
import json
import yt_dlp
import re

# ==========================================
# CONFIGURATION
# ==========================================
PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLqErQ2HVxtWjaXJCG-tJdKldq7ZSckTMG"
INPUT_DIR = "gemini_results_json"
OUTPUT_DIR = "db_seed_files"
COURSE_ID = 1

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def time_to_seconds(ts_str):
    """Converts [HH:MM:SS] or HH:MM:SS to integer seconds"""
    clean_ts = ts_str.replace('[', '').replace(']', '').strip()
    parts = [int(p) for p in clean_ts.split(':')]
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    elif len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return 0

def extract_canto(verse_name):
    """Extracts '1' from 'SB 1.1.2'"""
    # Regex to find the first number sequence after SB
    match = re.search(r'SB\s*(\d+)\.', verse_name)
    if match:
        return int(match.group(1))
    return 1 # Fallback to Canto 1 if parsing fails

# ==========================================
# 1. FETCH PLAYLIST METADATA (For video_id)
# ==========================================
print("Fetching playlist metadata to match video_ids...")
ydl_opts = {'extract_flat': True, 'quiet': True}
video_metadata = {}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    playlist_info = ydl.extract_info(PLAYLIST_URL, download=False)
    for index, video in enumerate(playlist_info.get('entries', []), start=1):
        video_metadata[index] = {
            "id": video.get('id'),
            "title": video.get('title')
        }

# ==========================================
# 2. STATE VARIABLES FOR DB RELATIONS
# ==========================================
chapters = []
sections = []
lectures = []

canto_to_chapter_id = {} # Maps Canto number -> DB Chapter ID
video_to_section_id = {} # Maps Video Index -> DB Section ID

chapter_id_counter = 1
section_id_counter = 1
lecture_id_counter = 1

# ==========================================
# 3. PROCESS GEMINI JSON FILES
# ==========================================
json_files = sorted([f for f in os.listdir(INPUT_DIR) if f.endswith('.json')])
print(f"Found {len(json_files)} processed JSON files. Generating database structures...\n")

for filename in json_files:
    filepath = os.path.join(INPUT_DIR, filename)
    
    # Get original video index from filename (e.g., "003" -> 3)
    try:
        video_index = int(filename.split('_')[0])
    except ValueError:
        continue
        
    # Get metadata
    meta = video_metadata.get(video_index, {"id": "UNKNOWN", "title": filename})
    video_id = meta["id"]
    original_title = meta["title"]
    
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            verses_data = json.load(f)
        except json.JSONDecodeError:
            print(f"Error parsing {filename}, skipping.")
            continue
            
    lecture_number_counter = 1 # Resets for each section (video)

    for verse in verses_data:
        verse_name = verse.get("verse_name", "")
        start_ts = verse.get("start_time", "00:00:00")
        end_ts = verse.get("end_time", "00:00:00")
        
        canto_num = extract_canto(verse_name)
        
        # --- BUILD CHAPTER ---
        if canto_num not in canto_to_chapter_id:
            chapters.append({
                "id": chapter_id_counter,
                "course_id": COURSE_ID,
                "chapter_number": canto_num,
                "title": f"BV: Canto {canto_num}",
                "description": ""
            })
            canto_to_chapter_id[canto_num] = chapter_id_counter
            chapter_id_counter += 1
            
        current_chapter_id = canto_to_chapter_id[canto_num]
        
        # --- BUILD SECTION ---
        # 1 Original Video = 1 Section
        if video_index not in video_to_section_id:
            sections.append({
                "id": section_id_counter,
                "chapter_id": current_chapter_id,
                "section_number": section_id_counter, # Or video_index if you want to tie it to playlist order
                "title": original_title,
                "description": ""
            })
            video_to_section_id[video_index] = section_id_counter
            section_id_counter += 1
            
        current_section_id = video_to_section_id[video_index]
        
        # --- BUILD LECTURE ---
        lectures.append({
            "id": lecture_id_counter,
            "chapter_id": current_chapter_id,
            "section_id": current_section_id,
            "lecture_number": lecture_number_counter,
            "title": verse_name,
            "description": "",
            "video_id": video_id,
            "start_timestamp": time_to_seconds(start_ts),
            "end_timestamp": time_to_seconds(end_ts),
            "thumbnail": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        })
        
        lecture_id_counter += 1
        lecture_number_counter += 1

# ==========================================
# 4. EXPORT TO JSON FILES
# ==========================================
with open(os.path.join(OUTPUT_DIR, 'chapters.json'), 'w', encoding='utf-8') as f:
    json.dump(chapters, f, indent=4)

with open(os.path.join(OUTPUT_DIR, 'sections.json'), 'w', encoding='utf-8') as f:
    json.dump(sections, f, indent=4)

with open(os.path.join(OUTPUT_DIR, 'lectures.json'), 'w', encoding='utf-8') as f:
    json.dump(lectures, f, indent=4)

print("Database generation complete!")
print(f"Created {len(chapters)} Chapters, {len(sections)} Sections, and {len(lectures)} Lectures.")
print("Files saved in 'db_seed_files' folder. Ready for pgAdmin/Sequelize import!")