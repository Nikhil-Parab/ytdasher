# small helpers
import re
def sanitize_filename(s: str) -> str:
    return re.sub(r'[^a-zA-Z0-9._-]', '_', s)[:200]

import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://media-monitoring-dashboard-default-rtdb.firebaseio.com/'
})

def save_transcription(video_id, data):
    ref = db.reference(f"videos/{video_id}")
    ref.set(data)

def get_video_data(video_id):
    ref = db.reference(f"videos/{video_id}")
    return ref.get()