import os
import json

# Define paths
INPUT_FILE = os.path.join("db_seed_files", "lectures.json")
OUTPUT_FILE = os.path.join("db_seed_files", "lectures_updated.json")

# 1. Load the existing lectures
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    lectures = json.load(f)



# 3. Group lectures by section_id
sections_map = {}
for lec in lectures:
    sid = lec["section_id"]
    if sid not in sections_map:
        sections_map[sid] = []
    sections_map[sid].append(lec)

new_lectures = []

# 4. Process each section
for sid, lecs in sections_map.items():
    # Sort chronologically by lecture_number
    lecs.sort(key=lambda x: x["lecture_number"])
    
    first_lec = lecs[0]
    
    # Check if the first lecture starts after 0 seconds (using the new -10s adjusted time)
    if first_lec["start_timestamp"] is not None and first_lec["start_timestamp"] > 0:
        # Create the Introduction lecture
        intro_lec = {
            "id": 0,  # Will be reassigned
            "chapter_id": first_lec["chapter_id"],
            "section_id": first_lec["section_id"],
            "lecture_number": 1,
            "title": "Introduction",
            "description": "",
            "video_id": first_lec["video_id"],
            "start_timestamp": 0,
            "end_timestamp": first_lec["start_timestamp"], # Neatly aligns with the adjusted start time
            "thumbnail": first_lec["thumbnail"]
        }
        new_lectures.append(intro_lec)
        
        # Shift all existing lectures in this section down by 1 position
        for l in lecs:
            l["lecture_number"] += 1
            new_lectures.append(l)
    else:
        # No introduction needed, already starts at 0
        new_lectures.extend(lecs)

# 5. Sort everything chronologically and fix the Primary Key IDs
new_lectures.sort(key=lambda x: (x["section_id"], x["lecture_number"]))

for index, lec in enumerate(new_lectures, start=1):
    lec["id"] = index

# 6. Save the updated list
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(new_lectures, f, indent=4)

print(f"Success! Processed {len(sections_map)} videos (sections).")
print(f"Total lectures expanded from {len(lectures)} to {len(new_lectures)}.")
print(f"Saved new file to: {OUTPUT_FILE}")