# ai-service/services/video_processor.py
import cv2
import os
import json

def process_video(video_path, frames_dir, output_json_path, interval_seconds=3):
    """
    Reads a video, extracts one frame every 'interval_seconds', 
    saves the frames as images, and creates a JSON index.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video not found at: {video_path}")

    os.makedirs(frames_dir, exist_ok=True)
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Error: Could not open the video file.")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0 or fps is None:
        fps = 30.0 

    frame_interval = int(fps * interval_seconds)
    print(f"Video FPS: {fps} | Extracting 1 frame every {interval_seconds}s...")

    frame_data = []
    frame_count = 0
    saved_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            timestamp = round(frame_count / fps, 2)
            filename = f"frame_{saved_count:03d}.jpg"
            file_path = os.path.join(frames_dir, filename)
            
            cv2.imwrite(file_path, frame)
            frame_data.append({"timestamp": timestamp, "file": filename})
            saved_count += 1

        frame_count += 1

    cap.release()

    with open(output_json_path, 'w') as json_file:
        json.dump(frame_data, json_file, indent=2)

    print(f"Success! Extracted {saved_count} frames.")
    return frame_data