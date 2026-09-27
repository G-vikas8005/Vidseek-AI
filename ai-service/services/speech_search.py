# ai-service/services/speech_search.py
import os
import json
from faster_whisper import WhisperModel
from sentence_transformers import SentenceTransformer, util
from utils.grouping import group_timestamps

# Global variables for lazy loading (saves RAM)
_whisper_model = None
_text_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        print("🎤 Loading Speech-to-Text (Whisper) model...")
        _whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
        print("✅ Whisper model loaded.")
    return _whisper_model

def get_text_model():
    global _text_model
    if _text_model is None:
        print("🧠 Loading Semantic Text Search model (first run downloads ~80MB)...")
        # all-MiniLM-L6-v2 is the gold standard for fast, lightweight sentence matching
        _text_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Text model loaded.")
    return _text_model

def search_speech_in_video(video_id, text_query, base_dir):
    """
    Extracts audio, transcribes it, and uses semantic search to find matching sentences.
    """
    whisper = get_whisper_model()
    text_model = get_text_model()
    
    # Find the video file
    video_path = os.path.join(base_dir, "data", "videos", f"{video_id}.mp4")
    if not os.path.exists(video_path):
        videos_dir = os.path.join(base_dir, "data", "videos")
        for filename in os.listdir(videos_dir):
            if filename.startswith(video_id):
                video_path = os.path.join(videos_dir, filename)
                break
                
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found for ID: {video_id}")

    print(f"🎧 Transcribing audio (this may take a minute)...")
    
    # 1. Transcribe the video audio
    segments, info = whisper.transcribe(video_path, beam_size=5)
    
    # Convert generator to a list so we can iterate over it multiple times
    segment_list = list(segments)
    
    # 2. Convert the user's query into an embedding (meaning vector)
    query_embedding = text_model.encode(text_query, convert_to_tensor=True)
    
    matches = []

    # 3. Compare query meaning to each transcribed segment's meaning
    for segment in segment_list:
        segment_text = segment.text.strip()
        
        # Skip very short segments (like "Hmm" or "Yeah") to avoid false positives
        if len(segment_text.split()) < 3:
            continue
            
        segment_embedding = text_model.encode(segment_text, convert_to_tensor=True)
        
        # Calculate cosine similarity (0.0 to 1.0)
        similarity = util.cos_sim(query_embedding, segment_embedding).item()
        
        # Threshold: 0.45 is a great sweet spot for semantic sentence matching
        if similarity >= 0.45:
            matches.append({
                'timestamp': segment.start,
                'score': float(similarity),
                'text': segment_text
            })

    # 4. Group nearby timestamps
    grouped_results = group_timestamps(matches, gap_threshold=3)

    # 5. Format to match the API Contract v1
    final_results = []
    for idx, group in enumerate(grouped_results):
        # Find the text associated with the start of this group
        group_text = next((m['text'] for m in matches if m['timestamp'] == group['start']), "Spoken text match")
        
        final_results.append({
            "id": f"speech_match_{video_id}_{idx}",
            "start": round(group['start'], 1),
            "end": round(group['end'], 1),
            "score": round(group['score'], 2),
            "type": "speech",
            "thumbnail": f"/thumbnails/{video_id}/frame_at_{round(group['start'], 1)}.jpg",
            "description": f"Spoke about: '{group_text}'"
        })

    # Sort by highest semantic similarity first
    final_results.sort(key=lambda x: x["score"], reverse=True)
    
    return {"success": True, "results": final_results}