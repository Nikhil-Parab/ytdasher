# 🚀 YouTube Media Dashboard (React + FastAPI)

This repository contains a **React + Vite** frontend and a **FastAPI** backend for a YouTube/media monitoring dashboard.  
Everything you need to run locally and deploy (Vercel + Render) is included below.

---

## 📁 Repository Layout

```
ytdasher/
├── backend/
│   ├── api_server.py           # main FastAPI app (example)
│   ├── requirements.txt        # Python dependencies (sample)
│   ├── firebase_credentials.json
│   ├── .env                    # environment variables (NOT committed to git)
│   └── ... other backend files
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/
    │   │   └── api.js
    │   └── ... other frontend files
    └── dist/ (after build)
```

---

## ⚠️ Before you start

Install these on your machine:

- Python 3.8+ — https://www.python.org/downloads/
- Node.js (v16+) — https://nodejs.org/
- npm (bundled with Node) or yarn
- Git — https://git-scm.com/downloads
- FFmpeg — https://ffmpeg.org/download.html

---

## 🔧 Backend — FastAPI (Full instructions)

### 1. Create & activate virtual environment

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac / Linux
source venv/bin/activate
```

### 2. requirements.txt (paste into backend/requirements.txt)

```
fastapi==0.95.2
uvicorn[standard]==0.22.0
yt-dlp==2024.10.22
youtube-transcript-api==0.6.1
sentence-transformers==2.2.2
transformers==4.34.0
faiss-cpu==1.7.4
pydantic==1.10.11
firebase-admin==6.3.0
openai-whisper==20231117
ffmpeg-python==0.2.0
python-multipart==0.0.6
aiofiles==23.2.1
requests==2.31.0
numpy==1.26.4
torch==2.2.2
tqdm==4.66.1
scikit-learn==1.3.2
openai==1.3.0
```

### 3. Create `.env` file in backend/

```
# Firebase Configuration
FIREBASE_CREDENTIALS=C:/Github/ytdasher/backend/firebase_credentials.json
FIREBASE_PROJECT_ID=media-monitoring-dashboa-e0c3b
FIREBASE_STORAGE_BUCKET=media-monitoring-dashboa-e0c3b.appspot.com
FIREBASE_DATABASE_URL=https://media-monitoring-dashboa-e0c3b-default-rtdb.firebaseio.com

# Server Configuration
HOST=127.0.0.1
PORT=8000
CORS_ORIGIN=http://localhost:5173
DEBUG=True
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run backend

```bash
uvicorn api_server:app --reload
```

Backend runs at: `http://127.0.0.1:8000`

---

## 🌐 Frontend — React + Vite

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run in development mode

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 3. API connection setup

Edit `frontend/src/api/api.js`:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // change this for production
});

export default api;
```

### 4. Build for production

```bash
npm run build
```

Output will be stored in `dist/`.

---

## ✅ Summary

- Backend: **FastAPI** hosted on Render
- Frontend: **React + Vite** hosted on Vercel
- Database/Storage: **Firebase**
- AI Models: **Sentence Transformers**, **Whisper**, **Transformers**
- Media Processing: **FFmpeg**, **yt-dlp**

Everything ready for local dev and cloud deployment. 🎯

---

## 👨‍💻 Author

**Nikhil P. Arab**  
Media Monitoring Dashboard — 2025
