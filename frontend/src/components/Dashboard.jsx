import React, { useEffect, useState } from "react";
import api from "../api/api";
import StatsCard from "./StatsCard";
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
    <div className="p-6 space-y-8 bg-slate-950 min-h-screen text-white transition-all duration-300">
      {/* 🏷️ Title */}
      <h2 className="text-3xl font-bold text-white tracking-tight border-b border-slate-800 pb-3">
        {metrics.title}
      </h2>

      {/* 🎥 Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 hover:bg-slate-800 transition-all p-4 rounded-xl text-center shadow-md">
          <p className="text-sm text-gray-400">Uploader</p>
          <p className="text-lg font-semibold mt-1">{metrics.uploader}</p>
        </div>
        <div className="bg-slate-900 hover:bg-slate-800 transition-all p-4 rounded-xl text-center shadow-md">
          <p className="text-sm text-gray-400">Duration (s)</p>
          <p className="text-lg font-semibold mt-1">
            {metrics.duration_seconds}
          </p>
        </div>
        <div className="bg-slate-900 hover:bg-slate-800 transition-all p-4 rounded-xl text-center shadow-md">
          <p className="text-sm text-gray-400">Views</p>
          <p className="text-lg font-semibold mt-1">{metrics.view_count}</p>
        </div>
        <div className="bg-slate-900 hover:bg-slate-800 transition-all p-4 rounded-xl text-center shadow-md">
          <p className="text-sm text-gray-400">Likes</p>
          <p className="text-lg font-semibold mt-1">{metrics.like_count}</p>
        </div>
      </div>

      {/* 🧠 Summary */}
      <section className="bg-slate-900 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-3 border-b border-slate-800 pb-1">
          Summary
        </h3>
        <p className="text-gray-300 leading-relaxed">{metrics.summary}</p>
      </section>

      {/* ❤️ Sentiment */}
      <section className="bg-slate-900 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-3 border-b border-slate-800 pb-1">
          Sentiment Analysis
        </h3>
        <p className="text-gray-300 mb-4">
          {metrics.sentiment.label} ({metrics.sentiment.score.toFixed(2)})
        </p>
        <div className="h-72 bg-slate-800 rounded-lg p-3">
          <SentimentChart sentimentData={metrics.sentiment_breakdown} />
        </div>
      </section>

      {/* 📝 Transcript */}
      <section className="bg-slate-900 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-3 border-b border-slate-800 pb-1">
          Transcript
        </h3>
        <div className="bg-slate-800 p-4 rounded-md text-gray-300 max-h-64 overflow-y-auto leading-relaxed">
          {metrics.transcript.text}
        </div>
      </section>
    </div>
  );
}
