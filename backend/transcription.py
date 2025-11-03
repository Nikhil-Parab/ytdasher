import os
import re
import uuid
import traceback
import yt_dlp
import whisper
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound


def extract_youtube_id(url: str) -> str:
    """Extract the 11-character YouTube video ID from a URL."""
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(pattern, url)
    if not match:
        raise ValueError(f"Invalid YouTube URL: {url}")
    return match.group(1)


def transcribe_from_youtube(url: str, data_dir: str):
    """Main transcription pipeline — fetch transcript or fall back to Whisper."""
    youtube_id = extract_youtube_id(url)
    print(f"🎬 Fetching video metadata for ID: {youtube_id}")

    # --- Get metadata using yt_dlp ---
    ydl_opts = {"quiet": True, "skip_download": True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    title = info.get("title")
    uploader = info.get("uploader")
    duration = info.get("duration")
    views = info.get("view_count")
    likes = info.get("like_count")
    description = info.get("description")

    # --- Try YouTube transcript first ---
    try:
        print("🗣 Fetching transcript via YouTubeTranscriptApi...")

        # ✅ Compatible fix for all versions of youtube-transcript-api
        try:
            # Preferred (newer API)
            transcript_list = YouTubeTranscriptApi.list_transcripts(youtube_id)
            transcript = transcript_list.find_transcript(['en'])
            subs = transcript.fetch()
        except AttributeError:
            # Fallback for older API
            subs = YouTubeTranscriptApi.get_transcript(youtube_id, languages=['en'])

        transcript_text = " ".join(
            [entry["text"] for entry in subs if entry["text"].strip()]
        )
        print("✅ Transcript successfully fetched via YouTube API.")

    except (TranscriptsDisabled, NoTranscriptFound):
        print("⚠️ No transcript available — using Whisper fallback...")
        transcript_text = transcribe_audio_fallback(url, data_dir)
    except Exception as e:
        traceback.print_exc()
        print(f"❌ Transcript fetch failed: {e}")
        transcript_text = transcribe_audio_fallback(url, data_dir)

    return {
        "youtube_id": youtube_id,
        "source_url": url,
        "title": title,
        "description": description,
        "uploader": uploader,
        "duration": duration,
        "view_count": views,
        "like_count": likes,
        "transcript_text": transcript_text,
    }


def transcribe_audio_fallback(url: str, data_dir: str) -> str:
    """Downloads audio using yt_dlp + transcribes with Whisper as fallback."""
    try:
        audio_path = os.path.join(data_dir, f"{uuid.uuid4()}.mp3")
        print(f"🎧 Downloading audio using yt_dlp → {audio_path}")

        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": audio_path,
            "quiet": False,
            "geo_bypass": True,
            "retries": 5,
            "http_headers": {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0.0.0 Safari/537.36"
                ),
                "Accept-Language": "en-US,en;q=0.9",
            },
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        print("🤖 Running Whisper fallback transcription...")
        model = whisper.load_model("base")
        result = model.transcribe(audio_path, fp16=False)
        transcript_text = result["text"].strip()
        print("✅ Whisper fallback transcription complete.")
        return transcript_text

    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"Whisper fallback failed: {e}")
