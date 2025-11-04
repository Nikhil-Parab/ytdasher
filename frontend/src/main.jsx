import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app.jsx";
import "./index.css"; // Tailwind CSS - IMPORT THIS FIRST
import "./styles/dashboard.css"; // Your custom CSS

createRoot(document.getElementById("root")).render(<App />);
