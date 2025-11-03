import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const SentimentChart = ({ sentimentData }) => {
  const data = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        label: "Sentiment Analysis",
        data: [
          sentimentData?.positive ?? 0,
          sentimentData?.neutral ?? 0,
          sentimentData?.negative ?? 0,
        ],
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
        borderRadius: 6,
        barThickness: 60,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#cbd5e1",
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "Sentiment Breakdown",
        color: "#f8fafc",
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        borderWidth: 1,
        titleColor: "#f1f5f9",
        bodyColor: "#e2e8f0",
      },
    },
    scales: {
      x: {
        ticks: { color: "#e2e8f0" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#e2e8f0" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div className="h-full w-full bg-slate-800 rounded-lg p-2">
      <Bar data={data} options={options} />
    </div>
  );
};

export default SentimentChart;
