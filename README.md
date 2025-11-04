## ⚙️ Environment Setup

### 🧩 1️⃣ Backend (FastAPI)

#### 🔧 Create and activate a virtual environment
```bash
cd backend
python -m venv venv
Activate it

Windows:

bash
Copy code
venv\Scripts\activate
Mac/Linux:

bash
Copy code
source venv/bin/activate
📦 Install backend dependencies
bash
Copy code
pip install -r requirements.txt
✅ requirements.txt
makefile
Copy code
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
(These extra libs like requests, torch, tqdm, scikit-learn, and openai are often used across AI modules and API pipelines.)

🧾 .env Example (Backend)
Create a .env file in /backend:

ini
Copy code
FIREBASE_CREDENTIALS=C:/Github/ytdasher/backend/firebase_credentials.json
FIREBASE_PROJECT_ID=media-monitoring-dashboa-e0c3b
FIREBASE_STORAGE_BUCKET=media-monitoring-dashboa-e0c3b.appspot.com
FIREBASE_DATABASE_URL=https://media-monitoring-dashboa-e0c3b-default-rtdb.firebaseio.com

HOST=127.0.0.1
PORT=8000
CORS_ORIGIN=http://localhost:5173
DEBUG=True
🚀 Run Backend
bash
Copy code
uvicorn api_server:app --reload
🟢 Backend runs at: http://127.0.0.1:8000

🌐 2️⃣ Frontend (React + Vite)
🧱 Install frontend dependencies
bash
Copy code
cd frontend
npm install
💡 Development server
bash
Copy code
npm run dev
🔗 App runs at: http://localhost:5173

⚙️ Build for production
bash
Copy code
npm run build
🔗 Frontend API Configuration
In frontend/src/api/api.js:

javascript
Copy code
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Change to backend URL if hosted elsewhere
});

export default api;
