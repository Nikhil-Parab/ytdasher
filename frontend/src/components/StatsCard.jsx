import React from "react";

export default function StatsCard({ title, value, color }) {
  return (
    <div
      style={{
        background: color || "#1e1e2f",
        padding: "1rem",
        borderRadius: "12px",
        color: "#fff",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        flex: "1 1 200px",
        margin: "0.5rem",
      }}
    >
      <h3 style={{ fontSize: "1rem", marginBottom: "0.3rem" }}>{title}</h3>
      <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}
