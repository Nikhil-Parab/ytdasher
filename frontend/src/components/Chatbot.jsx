import React, { useState } from "react";
import api from "../api/api";

export default function Chatbot({ videoId }) {
  const [q, setQ] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");

  async function ask() {
    if (!videoId) return alert("Select a video first");
    if (!q.trim()) return;
    if (loading) return; // Prevent duplicate requests

    const question = q.trim();

    // Prevent asking the same question twice in a row
    if (question === lastQuestion) {
      console.log("Duplicate question prevented");
      return;
    }

    setLastQuestion(question);
    setQ(""); // Clear input immediately
    setChat((prev) => [
      ...prev,
      { role: "user", text: question, id: Date.now() },
    ]);
    setLoading(true);

    try {
      const res = await api.post(`/chat/${videoId}`, {
        question,
        top_k: 4,
      });
      const answer = res.data.answer;
      setChat((prev) => [
        ...prev,
        { role: "assistant", text: answer, id: Date.now() + 1 },
      ]);
    } catch (e) {
      console.error(e);
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I couldn't process your question. Please try again.",
          id: Date.now() + 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-t-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">💬</span> Chat with Video
        </h3>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-[400px] max-h-[500px]">
        {chat.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-4xl mb-2">🤖</p>
            <p>Ask me anything about the video!</p>
          </div>
        ) : (
          chat.map((m, i) => (
            <div
              key={m.id || i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  m.role === "user"
                    ? "bg-teal-500 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                <p className="text-xs font-semibold mb-1 opacity-70">
                  {m.role === "user" ? "You" : "AI Assistant"}
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <p className="text-xs font-semibold mb-1 text-gray-600">
                AI Assistant
              </p>
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-2">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the video... (Press Enter to send)"
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows="2"
            disabled={loading || !videoId}
          />
          <button
            onClick={ask}
            disabled={loading || !videoId || !q.trim()}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Thinking...
              </>
            ) : (
              <>
                <span>📤</span> Ask
              </>
            )}
          </button>
        </div>
        {!videoId && (
          <p className="text-xs text-gray-500 mt-2">
            ℹ️ Select a video first to start chatting
          </p>
        )}
      </div>
    </div>
  );
}
