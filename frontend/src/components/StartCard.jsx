import React from "react";

export default function StatsCard({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">
        {value !== null && value !== undefined ? value : "—"}
      </div>
    </div>
  );
}
