import React, { useState } from "react";
import api from "../api/api";

export default function VideoInput({ onProcessed }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleProcess() {
    if (!url) return alert("Paste a YouTube URL");
    setLoading(true);
    try {
      const res = await api.post("/process-video", { url });
      if (res.data && res.data.video_id) {
        onProcessed && onProcessed(res.data.video_id);
        alert("Processed: " + (res.data.title || res.data.video_id));
      }
    } catch (e) {
      console.error(e);
      alert("Processing failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="video-input">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube URL"
      />
      <button onClick={handleProcess} disabled={loading}>
        {loading ? "Processing..." : "Process Video"}
      </button>
    </div>
  );
}
