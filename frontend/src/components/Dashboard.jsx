import React, { useEffect, useState } from "react";
import api from "../api/api";
import SentimentChart from "./SentimentChart";

export default function Dashboard({ videoId }) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function load() {
      if (!videoId) return setMetrics(null);
      try {
        const res = await api.get(`/metrics/${videoId}`);
        setMetrics(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [videoId]);

  if (!videoId)
    return (
      <div className="text-gray-400 text-center mt-20">
        Select or process a video to see metrics.
      </div>
    );

  if (!metrics)
    return (
      <div className="text-gray-400 text-center mt-20">Loading metrics...</div>
    );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen transition-all duration-300">
      {/* 🏷️ Title */}
      <h2 className="text-3xl font-bold text-gray-900 tracking-tight border-b border-gray-300 pb-3">
        {metrics.title}
      </h2>

      {/* 🎥 Stats - Horizontal Black Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg shadow-lg p-5 flex items-center gap-3 border border-gray-700">
          <span className="text-3xl">👤</span>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Uploader</p>
            <p className="text-lg font-bold text-white">{metrics.uploader}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-5 flex items-center gap-3 border border-gray-700">
          <span className="text-3xl">⏱️</span>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">
              Duration (s)
            </p>
            <p className="text-lg font-bold text-white">
              {metrics.duration_seconds}
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-5 flex items-center gap-3 border border-gray-700">
          <span className="text-3xl">👁️</span>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Views</p>
            <p className="text-lg font-bold text-white">
              {metrics.view_count.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-5 flex items-center gap-3 border border-gray-700">
          <span className="text-3xl">❤️</span>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Likes</p>
            <p className="text-lg font-bold text-white">
              {metrics.like_count.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 🧠 Summary */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📝</span> Summary
        </h3>
        <p className="text-gray-700 leading-relaxed">{metrics.summary}</p>
      </section>

      {/* ❤️ Sentiment */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900 flex items-center gap-2">
          <span className="text-2xl">💭</span> Sentiment Analysis
        </h3>
        <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg mb-4 border border-gray-300">
          <span className="text-lg font-semibold text-gray-900">
            {metrics.sentiment.label}
          </span>
          <span className="text-gray-600 ml-2">
            ({(metrics.sentiment.score * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="h-80 rounded-lg">
          <SentimentChart sentimentData={metrics.sentiment_breakdown} />
        </div>
      </section>

      {/* 📝 Transcript */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📄</span> Transcript
        </h3>
        <div className="bg-gray-50 p-5 rounded-lg text-gray-800 max-h-64 overflow-y-auto leading-relaxed border border-gray-200">
          {metrics.transcript.text}
        </div>
      </section>
    </div>
  );
}
