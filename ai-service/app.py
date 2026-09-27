# ai-service/app.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.video_processor import process_video
from services.face_search import search_person_in_video
from services.visual_search import search_visual_in_video
from services.speech_search import search_speech_in_video
from services.search_engine import search_combined_in_video  # <-- ADDED

app = FastAPI(title="VidSeek AI Service")

class ProcessVideoRequest(BaseModel):
    videoId: str
    videoPath: str

class SearchRequest(BaseModel):
    videoId: str
    type: str          
    query: Optional[str] = None
    photoPath: Optional[str] = None

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/process-video")
def start_processing(request: ProcessVideoRequest):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    video_id = request.videoId
    video_path = request.videoPath
    
    frames_dir = os.path.join(base_dir, "data", "frames", video_id)
    index_dir = os.path.join(base_dir, "data", "indexes")
    output_json = os.path.join(index_dir, f"{video_id}_index.json")
    
    try:
        process_video(
            video_path=video_path, 
            frames_dir=frames_dir, 
            output_json_path=output_json, 
            interval_seconds=3
        )
        return {"success": True, "videoId": video_id, "status": "completed"}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/search")
def handle_search(request: SearchRequest):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    if request.type == "person":
        if not request.photoPath:
            raise HTTPException(status_code=400, detail="photoPath is required for person search")
        result = search_person_in_video(request.videoId, request.photoPath, base_dir)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Unknown error"))
        return result
        
    elif request.type == "text":
        if not request.query:
            raise HTTPException(status_code=400, detail="query is required for text search")
        return search_visual_in_video(request.videoId, request.query, base_dir)
        
    elif request.type == "speech":
        if not request.query:
            raise HTTPException(status_code=400, detail="query is required for speech search")
        return search_speech_in_video(request.videoId, request.query, base_dir)
        
    elif request.type == "combined":  # <-- ADDED
        if not request.query:
            raise HTTPException(status_code=400, detail="query is required for combined search")
        return search_combined_in_video(request.videoId, request.query, base_dir)
        
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported search type: {request.type}")