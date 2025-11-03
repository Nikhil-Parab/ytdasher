# This file kept minimal as Realtime DB is schemaless.
# If desired, define local dataclasses / Pydantic models here for validation.

from pydantic import BaseModel
from typing import Optional, Dict

class VideoRecord(BaseModel):
    video_id: str
    youtube_id: Optional[str]
    source_url: Optional[str]
    title: Optional[str]
    description: Optional[str]
    uploader: Optional[str]
    duration: Optional[int]
    view_count: Optional[int]
    like_count: Optional[int]
    transcript_text: Optional[str]
    summary: Optional[str]
    sentiment: Optional[Dict]
    chunks_meta: Optional[Dict]
