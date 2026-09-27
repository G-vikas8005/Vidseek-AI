# ai-service/services/visual_search.py
import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util
from utils.grouping import group_timestamps

# Global variable for lazy loading (saves RAM)
_clip_model = None

def get_clip_model():
    global _clip_model
    if _clip_model is None:
        print("Loading Visual Search (CLIP) model into memory (first run downloads weights)...")
        # 'clip-ViT-B-32' is lightweight, fast, and works great on CPU for 8GB RAM laptops
        _clip_model = SentenceTransformer('clip-ViT-B-32')
        print("Visual Search model loaded successfully.")
    return _clip_model

def search_visual_in_video(video_id, text_query, base_dir):
    """
    Compares a text query against extracted video frames using CLIP.
    """
    model = get_clip_model()
    
    frames_dir = os.path.join(base_dir, "data", "frames", video_id)
    index_path = os.path.join(base_dir, "data", "indexes", f"{video_id}_index.json")

    if not os.path.exists(index_path):
        raise FileNotFoundError(f"Video index not found. Process the video first.")

    with open(index_path, 'r') as f:
        frame_index = json.load(f)

    # 1. Convert the text query into an embedding (list of numbers)
    text_embedding = model.encode(text_query, convert_to_tensor=True)

    matches = []

    # 2. Compare the text embedding to each frame's image embedding
    for frame_info in frame_index:
        frame_path = os.path.join(frames_dir, frame_info['file'])
        
        if os.path.exists(frame_path):
            # Encode the image
            image_embedding = model.encode(frame_path, convert_to_tensor=True)
            
            # Calculate cosine similarity (0.0 to 1.0, where 1.0 is a perfect match)
            similarity = util.cos_sim(text_embedding, image_embedding).item()
            
            # CLIP threshold: 0.25 is a good starting point for "relevant" matches
            if similarity >= 0.25:
                matches.append({
                    'timestamp': frame_info['timestamp'],
                    'score': float(similarity),
                    'file': frame_info['file']
                })

    # 3. Group nearby timestamps
    grouped_results = group_timestamps(matches, gap_threshold=5)

    # 4. Format to match the API Contract v1
    final_results = []
    for idx, group in enumerate(grouped_results):
        final_results.append({
            "id": f"visual_match_{video_id}_{idx}",
            "start": group['start'],
            "end": group['end'],
            "score": round(group['score'], 2),
            "type": "visual",
            "thumbnail": f"/thumbnails/{video_id}/frame_at_{group['start']}.jpg",
            "description": f"Visual match for query: '{text_query}'"
        })

    # Sort by highest score first
    final_results.sort(key=lambda x: x['score'], reverse=True)

    return {"success": True, "results": final_results}