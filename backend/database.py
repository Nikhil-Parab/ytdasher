import firebase_admin
from firebase_admin import credentials, db
import os
import json

FIREBASE_ROOT = "/videos"  # root path in Realtime DB

def firebase_init(cred_path: str):
    if not os.path.exists(cred_path):
        raise FileNotFoundError("Firebase credentials JSON not found at: " + cred_path)
    cred = credentials.Certificate(cred_path)
    # if already initialized, skip
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred, {
            'databaseURL': get_database_url_from_cred(cred_path)
        })

def get_database_url_from_cred(cred_path: str) -> str:
    # attempt to infer DB url from credential file if present (user can override later)
    with open(cred_path, "r", encoding="utf-8") as f:
        j = json.load(f)
    # typical service account does not include databaseURL; user should set it in the json under 'databaseURL'
    db_url = j.get('databaseURL')
    if db_url:
        return db_url
    # fallback: require environment variable
    env = os.environ.get("FIREBASE_DATABASE_URL")
    if env:
        return env
    raise EnvironmentError("Realtime Database URL not found in credentials json nor FIREBASE_DATABASE_URL env var. Add 'databaseURL' to the credentials json or set env var.")

def save_video_record(video_id: str, record: dict):
    ref = db.reference(FIREBASE_ROOT + f"/{video_id}")
    # initialize chunks_meta empty; frontend or chunk saves will populate
    record_copy = dict(record)
    record_copy["chunks_meta"] = {}
    ref.set(record_copy)

def save_chunk_record(video_id: str, chunk_id: str, chunk_obj: dict):
    ref = db.reference(FIREBASE_ROOT + f"/{video_id}/chunks_meta/{chunk_id}")
    ref.set(chunk_obj)

def list_videos():
    ref = db.reference(FIREBASE_ROOT)
    all_v = ref.get()
    if not all_v:
        return []
    out = []
    for vid, rec in all_v.items():
        out.append({
            "video_id": vid,
            "youtube_id": rec.get("youtube_id"),
            "title": rec.get("title"),
            "uploader": rec.get("uploader"),
            "duration": rec.get("duration"),
            "view_count": rec.get("view_count")
        })
    return out

def get_video_record(video_id: str):
    ref = db.reference(FIREBASE_ROOT + f"/{video_id}")
    return ref.get()
