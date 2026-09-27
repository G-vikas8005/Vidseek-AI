# ai-service/services/search_engine.py
import os
from services.visual_search import search_visual_in_video
from services.speech_search import search_speech_in_video

def times_overlap(start1, end1, start2, end2):
    """Checks if two time ranges overlap."""
    return start1 <= end2 and start2 <= end1

def search_combined_in_video(video_id, text_query, base_dir):
    """
    Runs both Visual and Speech search, then merges and boosts overlapping results.
    """
    print(f"🚀 Starting Combined Search for: '{text_query}'...")
    
    # 1. Run Visual Search (CLIP)
    print("👁️  Searching for visual matches...")
    visual_response = search_visual_in_video(video_id, text_query, base_dir)
    visual_results = visual_response.get("results", [])
    
    # 2. Run Speech Search (Whisper)
    print("🎤 Searching for spoken matches...")
    speech_response = search_speech_in_video(video_id, text_query, base_dir)
    speech_results = speech_response.get("results", [])
    
    # 3. Merge and Boost Results
    combined_results = []
    
    # We start by taking all the visual results as our base
    for v_res in visual_results:
        v_start = v_res["start"]
        v_end = v_res["end"]
        v_score = v_res["score"]
        
        # Check if any speech result overlaps with this visual result
        match_found = False
        for s_res in speech_results:
            if times_overlap(v_start, v_end, s_res["start"], s_res["end"]):
                # OVERLAP FOUND! The AI sees it AND hears it.
                # Boost the score by 0.2 (up to a maximum of 1.0)
                boosted_score = min(1.0, round(v_score + 0.2, 2))
                
                v_res["score"] = boosted_score
                v_res["type"] = "combined"
                v_res["description"] = f"Visual & Audio match: '{text_query}'"
                match_found = True
                break # Found an overlap, no need to check other speech results for this visual
                
        combined_results.append(v_res)
        
    # Now, add any speech results that DID NOT overlap with a visual result
    for s_res in speech_results:
        s_start = s_res["start"]
        s_end = s_res["end"]
        
        # Check if this speech result overlaps with ANY visual result
        is_unique = True
        for v_res in visual_results:
            if times_overlap(s_start, s_end, v_res["start"], v_res["end"]):
                is_unique = False
                break
                
        # If it didn't overlap, we still want to include it (maybe they just said the word without showing it)
        if is_unique:
            combined_results.append(s_res)

    # 4. Sort by highest score first
    combined_results.sort(key=lambda x: x["score"], reverse=True)
    
    print(f"✅ Combined search complete! Found {len(combined_results)} total moments.")

    return {"success": True, "results": combined_results}