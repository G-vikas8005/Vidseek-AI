# 🎬 VidSeek AI - Python AI Microservice

Welcome to the **VidSeek AI** Python backend! This is the core AI engine responsible for processing videos and performing multi-modal searches. It allows users to find specific people, visual scenes, or spoken moments in a video using natural language or reference photos.

Built for the VidSeek AI student project, this service is optimized to run locally on standard hardware (8GB RAM) without requiring expensive GPU training.

---

## 🌟 Key Abilities & Features

1. **🎞️ Video Processing:** Extracts frames at regular intervals and creates a searchable timestamp index.
2. **👤 Person Search (Face Recognition):** Finds a specific person in a video using a reference photo (powered by DeepFace).
3. **👁️ Visual Search (Text-to-Video):** Finds visual scenes matching a text description (e.g., "people on stage") using CLIP.
4. **🎤 Semantic Speech Search:** Transcribes audio and searches for the *meaning* of a sentence, not just exact keywords (powered by Faster-Whisper & Sentence-Transformers).
5. **🧠 Combined Smart Search:** Simultaneously checks visual and audio cues. If the AI *sees* and *hears* the query at the same time, it boosts the confidence score for highly accurate results.

---

## 🛠️ Tech Stack

* **Language:** Python 3.10
* **Web Framework:** FastAPI & Uvicorn
* **Computer Vision:** OpenCV, DeepFace (Facenet)
* **Vision-Language:** Sentence-Transformers (CLIP ViT-B-32)
* **Speech-to-Text:** Faster-Whisper (CTranslate2)
* **Semantic Text:** Sentence-Transformers (all-MiniLM-L6-v2)
* **Audio Extraction:** FFmpeg

---

## ⚙️ Prerequisites

Before running the project, ensure you have the following installed on your machine:

1. **Python 3.10.x** 
   *(Note: Python 3.11+ may cause C++ compilation errors with some AI libraries. 3.10 is the stable standard for this stack).*
2. **FFmpeg** (Required for audio extraction in Speech Search)
   * **Windows:** `winget install Gyan.FFmpeg`
   * **Mac:** `brew install ffmpeg`
   * **Linux:** `sudo apt install ffmpeg`

---

## 🚀 Installation & Execution Process

Follow these steps to get the AI service running locally.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ai-service