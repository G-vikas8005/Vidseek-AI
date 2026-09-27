# ai-service/services/face_search.py
import os
import json
from deepface import DeepFace
from utils.grouping import group_timestamps

def search_person_in_video(video_id, reference_photo_path, base_dir):
    """
    Compares a reference photo against extracted video frames using DeepFace.
    """
    # 1. Define paths
    frames_dir = os.path.join(base_dir, "data", "frames", video_id)
    index_path = os.path.join(base_dir, "data", "indexes", f"{video_id}_index.json")

    # 2. Check if required files exist
    if not os.path.exists(reference_photo_path):
        raise FileNotFoundError(f"Reference photo not found: {reference_photo_path}")
    if not os.path.exists(index_path):
        raise FileNotFoundError(f"Video index not found. Process the video first.")

    # 3. Load the JSON index to map filenames back to timestamps
    with open(index_path, 'r') as f:
        frame_index = json.load(f)

    # Create a quick lookup dictionary: filename -> timestamp
    file_to_timestamp = {item['file']: item['timestamp'] for item in frame_index}

    print("Searching for faces using DeepFace (first run may download AI weights)...")

    try:
        # DeepFace.find searches the entire folder (db_path) against the reference image.
        # 'Facenet' is a great balance of speed and accuracy.
        # enforce_detection=False prevents crashes if a specific frame has no face.
        # silent=True keeps the terminal output clean.
        dfs = DeepFace.find(
            img_path=reference_photo_path,
            db_path=frames_dir,
            model_name="Facenet",
            enforce_detection=False,
            silent=True
        )

        # DeepFace returns a list of DataFrames. We want the first one.
        df = dfs[0]

    except Exception as e:
        print(f"DeepFace search error: {e}")
        return {"success": False, "error": "Could not find matching faces in the video."}

    # 4. Filter the results
    # DeepFace uses "distance" where LOWER is better (0.0 is an exact match).
    # For the Facenet model, a distance below 0.40 is generally considered a strong match.
    threshold = 0.40
    matches_df = df[df['distance'] <= threshold]

    # 5. Extract matches and map back to timestamps
    matches = []
    for index, row in matches_df.iterrows():
        # The 'identity' column contains the full file path. We just need the filename.
        full_path = row['identity']
        filename = os.path.basename(full_path)
        
        # Look up the timestamp from our JSON index
        if filename in file_to_timestamp:
            matches.append({
                'timestamp': file_to_timestamp[filename],
                'score': float(1.0 - row['distance']), # Convert distance to a 0-1 similarity score
                'file': filename
            })

    # 6. Group nearby timestamps
    grouped_results = group_timestamps(matches, gap_threshold=5)

    # 7. Format to match the API Contract v1
    final_results = []
    for idx, group in enumerate(grouped_results):
        final_results.append({
            "id": f"person_match_{video_id}_{idx}",
            "start": group['start'],
            "end": group['end'],
            "score": round(group['score'], 2),
            "type": "person",
            "thumbnail": f"/thumbnails/{video_id}/frame_at_{group['start']}.jpg",
            "description": "Possible person match based on facial similarity."
        })

    # Sort by highest score first
    final_results.sort(key=lambda x: x['score'], reverse=True)

    return {"success": True, "results": final_results}