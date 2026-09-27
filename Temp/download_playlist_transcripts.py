import os
import time
import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi

PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLqErQ2HVxtWjaXJCG-tJdKldq7ZSckTMG"
OUTPUT_DIR = "transcripts"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def format_timestamp(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hrs:02d}:{mins:02d}:{secs:02d}"

ytt_api = YouTubeTranscriptApi()

ydl_opts = {'extract_flat': True, 'quiet': True}
print("Fetching playlist data...")
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    playlist_info = ydl.extract_info(PLAYLIST_URL, download=False)
    videos = playlist_info.get('entries', [])

print(f"Found {len(videos)} videos. Downloading Gemini-optimized transcripts...\n")

for index, video in enumerate(videos, start=1):
    video_id = video.get('id')
    raw_title = video.get('title', f'video_{index}')
    clean_title = "".join(c for c in raw_title if c.isalnum() or c in " ._-").rstrip()
    
    out_file = os.path.join(OUTPUT_DIR, f"{index:03d}_{clean_title}.txt")
    
    if os.path.exists(out_file):
        print(f"[{index}/{len(videos)}] Skipping (already exists): {clean_title}")
        continue

    try:
        transcript_list = ytt_api.list(video_id)
        
        try:
            transcript = transcript_list.find_transcript(['en', 'hi', 'sa'])
        except Exception:
            transcript = transcript_list.find_generated_transcript(['en', 'en-US', 'en-IN'])
            
        data = transcript.fetch()
        
        with open(out_file, "w", encoding="utf-8") as f:
            for item in data:
                # --- THE FIX IS HERE ---
                # This safely handles both the old Dictionary format and the new Object format
                start_time = item['start'] if isinstance(item, dict) else item.start
                raw_text = item['text'] if isinstance(item, dict) else item.text
                
                ts = format_timestamp(start_time)
                clean_text = raw_text.replace('\n', ' ').strip()
                f.write(f"[{ts}] {clean_text}\n")
                
        print(f"[{index}/{len(videos)}] Saved: {clean_title}")
        
    except Exception as e:
        print(f"[{index}/{len(videos)}] Failed {video_id}: {e}")

    time.sleep(0.5)

print("\nDone! All transcripts are saved in the 'transcripts' folder ready for Gemini.")