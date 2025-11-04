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
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 80,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(148, 163, 184, 0.3)",
        borderWidth: 1,
        titleColor: "#f1f5f9",
        bodyColor: "#e2e8f0",
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#f1f5f9",
          font: {
            size: 13,
            weight: "500",
          },
        },
        grid: {
          display: false,
        },
        border: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          color: "#cbd5e1",
          font: { size: 12 },
          callback: function (value) {
            return (value * 100).toFixed(0) + "%";
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 shadow-lg border border-slate-700">
      <Bar data={data} options={options} />
    </div>
  );
};

export default SentimentChart;
