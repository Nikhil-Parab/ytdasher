import React, { useState } from "react";
import api from "../api/api";

export default function Chatbot({ videoId }) {
  const [q, setQ] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!videoId) return alert("Select a video first");
    if (!q) return;
    setChat((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await api.post(`/chat/${videoId}`, { question: q, top_k: 4 });
      const answer = res.data.answer;
      setChat((prev) => [...prev, { role: "assistant", text: answer }]);
      setQ("");
    } catch (e) {
      console.error(e);
      alert("Chat failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbot">
      <h3>Chat with Video</h3>
      <div className="chat-box">
        {chat.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "bubble user" : "bubble ai"}
          >
            <strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.text}
          </div>
        ))}
      </div>
      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask about the video..."
      />
      <button onClick={ask} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>
    </div>
  );
}
