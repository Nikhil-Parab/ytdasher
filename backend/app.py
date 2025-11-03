from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import uuid
import os
import traceback
from pathlib import Path
from dotenv import load_dotenv

# === Load environment variables first ===
load_dotenv()

# === Imports from internal modules ===
from transcription import transcribe_from_youtube
from analysis import (
    summarize_text,
    analyze_sentiment,
    chunk_texts,
    compute_and_store_embeddings,
    retrieve_answer,
)
from database import (
    firebase_init,
    save_video_record,
    save_chunk_record,
    list_videos,
    get_video_record,
)

# === Directories ===
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# === Firebase Initialization ===
backend_dir = Path(__file__).resolve().parent
firebase_credentials_path = os.getenv(
    "FIREBASE_CREDENTIALS",
    str(backend_dir / "firebase_credentials.json")
)

if not os.path.exists(firebase_credentials_path):
    raise FileNotFoundError(f"❌ Firebase credentials file not found at: {firebase_credentials_path}")

firebase_init(firebase_credentials_path)

# === FastAPI App ===
app = FastAPI(title="🎬 Media Monitoring Dashboard Backend (Firestore→Realtime)")

# === ✅ CORS Middleware ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React frontend
        "http://127.0.0.1:3000",
        os.getenv("CORS_ORIGIN", "http://localhost:5173"),  # Vite fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === Models ===
class ProcessRequest(BaseModel):
    url: str


class ChatRequest(BaseModel):
    question: str
    top_k: int = 4


# === Routes ===
@app.post("/process-video")
async def process_video(req: ProcessRequest) -> Any:
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Empty URL")

    try:
        print(f"🎥 Starting transcription for: {url}")
        meta = transcribe_from_youtube(url, data_dir=str(DATA_DIR))
        print("✅ Transcription complete")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

    video_id = str(uuid.uuid4())
    transcript_text = meta.get("transcript_text", "")
    if not transcript_text or len(transcript_text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Transcript empty")

    try:
        print("🧠 Summarizing transcript...")
        summary = summarize_text(transcript_text)

        print("💬 Analyzing sentiment...")
        sentiment_label, sentiment_score = analyze_sentiment(transcript_text)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    # Save to Firebase
    video_record = {
        "video_id": video_id,
        "source_url": meta.get("source_url"),
        "youtube_id": meta.get("youtube_id"),
        "title": meta.get("title"),
        "description": meta.get("description"),
        "uploader": meta.get("uploader"),
        "duration": meta.get("duration"),
        "view_count": meta.get("view_count"),
        "like_count": meta.get("like_count"),
        "transcript_text": transcript_text,
        "summary": summary,
        "sentiment": {"label": sentiment_label, "score": sentiment_score},
    }

    try:
        print("💾 Saving video record to Firebase...")
        save_video_record(video_id, video_record)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save video record: {e}")

    # Chunk transcript and store chunks
    try:
        print("📑 Chunking transcript and saving to database...")
        chunks = chunk_texts(transcript_text, max_words=200, overlap_words=40)
        for idx, txt in enumerate(chunks):
            chunk_id = str(uuid.uuid4())
            save_chunk_record(video_id, chunk_id, {"chunk_index": idx, "text": txt})
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chunk storage failed: {e}")

    # Compute embeddings
    try:
        print("🧩 Computing embeddings and saving FAISS index...")
        compute_and_store_embeddings(video_id, chunks, storage_dir=str(DATA_DIR))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Embedding computation failed: {e}")

    print("✅ Video processing completed successfully.")
    return {
        "video_id": video_id,
        "title": video_record["title"],
        "uploader": video_record["uploader"],
        "duration": video_record["duration"],
        "view_count": video_record["view_count"],
        "like_count": video_record["like_count"],
        "summary": summary,
        "sentiment": video_record["sentiment"],
        "chunks": len(chunks),
    }


@app.get("/videos")
async def get_videos():
    return list_videos()


@app.get("/metrics/{video_id}")
async def metrics(video_id: str):
    rec = get_video_record(video_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Video not found")

    transcript = rec.get("transcript_text", "")
    word_count = len(transcript.split())
    char_count = len(transcript)
    chunks_meta = rec.get("chunks_meta", {})
    chunks_count = len(chunks_meta) if isinstance(chunks_meta, dict) else 0

    # ✅ Get sentiment info safely
    sentiment = rec.get("sentiment", {})
    label = sentiment.get("label", "").upper()
    score = sentiment.get("score", 0)

    # ✅ Create breakdown for chart
    sentiment_breakdown = {
        "positive": score if label == "POSITIVE" else 0.0,
        "neutral": score if label == "NEUTRAL" else 0.0,
        "negative": score if label == "NEGATIVE" else 0.0,
    }

    return {
        "video_id": rec.get("video_id"),
        "youtube_id": rec.get("youtube_id"),
        "title": rec.get("title"),
        "description": rec.get("description"),
        "uploader": rec.get("uploader"),
        "duration_seconds": rec.get("duration"),
        "view_count": rec.get("view_count"),
        "like_count": rec.get("like_count"),
        "summary": rec.get("summary"),
        "sentiment": rec.get("sentiment"),
        "sentiment_breakdown": sentiment_breakdown,  # ✅ Added field
        "transcript": {
            "text": transcript,
            "word_count": word_count,
            "char_count": char_count,
            "chunks_count": chunks_count,
        },
    }


@app.post("/chat/{video_id}")
async def chat(video_id: str, body: ChatRequest):
    q = body.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Empty question")

    rec = get_video_record(video_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        answer = retrieve_answer(video_id, q, top_k=body.top_k, storage_dir=str(DATA_DIR))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Retrieval/generation failed: {e}")

    return {"question": q, "answer": answer}
