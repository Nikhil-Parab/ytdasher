import React, { useEffect, useState } from "react";
import VideoInput from "./components/VideoInput";
import Dashboard from "./components/Dashboard";
import Chatbot from "./components/Chatbot";
import api from "./api/api";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);

  async function loadVideos() {
    try {
      const res = await api.get("/videos");
      setVideos(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <div className="app">
      <header className="nav">
        <img src="/public/logo.svg" alt="logo" className="logo" />
        <h1>Media Monitoring Dashboard</h1>
      </header>

      <main className="main-grid">
        <aside className="left-pane">
          <VideoInput
            onProcessed={(vid) => {
              loadVideos();
              setSelected(vid);
            }}
          />
          <div className="video-list">
            <h4>Processed Videos</h4>
            <select
              onChange={(e) => setSelected(e.target.value)}
              value={selected || ""}
            >
              <option value="">-- Select --</option>
              {videos.map((v) => (
                <option key={v.video_id} value={v.video_id}>
                  {v.title} ({v.uploader})
                </option>
              ))}
            </select>
          </div>
        </aside>

        <section className="center-pane">
          <Dashboard videoId={selected} />
        </section>

        <aside className="right-pane">
          <Chatbot videoId={selected} />
        </aside>
      </main>
    </div>
  );
}
