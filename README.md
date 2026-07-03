# ReWear AI — Complete Build & Deployment Guide

## What You're Building

A full-stack web app with:
- **Frontend**: Next.js 14 (TypeScript + Tailwind) → deployed on **Vercel** (free)
- **Backend**: FastAPI (Python) → deployed on **Railway** (free tier) or **Render** (free)
- **AI Model**: Llama 4 Scout Vision via **Groq API** (free tier, 6,000 tokens/min)

**Total cost: $0/month** on free tiers.

---

## Project Structure

```
rewear-ai/
├── backend/
│   ├── main.py              ← FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   └── components/
    │       ├── Header.tsx
    │       ├── Footer.tsx
    │       ├── UploadZone.tsx
    │       └── AnalysisResult.tsx
    ├── package.json
    ├── tailwind.config.js
    ├── next.config.js
    ├── tsconfig.json
    └── .env.example
```

---

## STEP 1 — Get Your Free Groq API Key

Groq gives you a **free API key** with generous limits (6,000 tokens/min, no credit card needed).

1. Go to **https://console.groq.com**
2. Sign up with Google or email
3. Click **API Keys** in the left sidebar
4. Click **Create API Key** → name it `rewear-ai`
5. **Copy the key** — it starts with `gsk_...`
6. Save it somewhere safe — you'll need it in Step 3 and Step 4

> **Model used**: `meta-llama/llama-4-scout-17b-16e-instruct`
> This is a free vision model on Groq that can analyze images.

---

## STEP 2 — Set Up the Project Locally

### Prerequisites
Make sure you have installed:
- **Node.js 18+** → https://nodejs.org
- **Python 3.11+** → https://python.org
- **Git** → https://git-scm.com

### 2a. Clone / create the project

```bash
# Create the project folder
mkdir rewear-ai
cd rewear-ai
git init
```

### 2b. Set up the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

Now open `.env` and paste your Groq API key:
```
GROQ_API_KEY=gsk_your_actual_key_here
```

**Run the backend:**
```bash
uvicorn main:app --reload --port 8000
```

Test it's working:
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","groq_configured":true}
```

### 2c. Set up the Frontend

```bash
# Open a new terminal tab
cd frontend

# Install dependencies
npm install

# Create your .env.local file
cp .env.example .env.local
```

The `.env.local` file should have:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Run the frontend:**
```bash
npm run dev
```

Open **http://localhost:3000** in your browser — the app is running!

---

## STEP 3 — Deploy the Backend to Railway (Free)

Railway gives you $5 free credits per month — enough for a small app.

### 3a. Push backend to GitHub

```bash
cd rewear-ai

# Create a new GitHub repo at github.com/new
# Then:
git remote add origin https://github.com/YOUR_USERNAME/rewear-ai.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 3b. Deploy on Railway

1. Go to **https://railway.app**
2. Sign up with GitHub (free)
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `rewear-ai` repository
5. Railway auto-detects it. When prompted for the **Root Directory**, type: `backend`
6. Click **Deploy**

### 3c. Set the Environment Variable on Railway

1. In your Railway project, click your service
2. Go to **Variables** tab
3. Click **Add Variable**:
   - Name: `GROQ_API_KEY`
   - Value: `gsk_your_actual_key_here`
4. Click **Add** — Railway will automatically redeploy

### 3d. Get your backend URL

1. Go to **Settings** → **Networking** → **Generate Domain**
2. Copy the URL — it looks like: `https://rewear-ai-backend-production.up.railway.app`
3. **Save this URL** — you'll need it for the frontend

**Test your deployed backend:**
```bash
curl https://YOUR-RAILWAY-URL.railway.app/health
```

---

## STEP 4 — Deploy the Frontend to Vercel (Free)

### 4a. Deploy on Vercel

1. Go to **https://vercel.com**
2. Sign up with GitHub (free)
3. Click **Add New Project** → **Import Git Repository**
4. Select your `rewear-ai` repository
5. Set **Root Directory** to `frontend`
6. Leave Framework Preset as **Next.js**

### 4b. Set the Environment Variable on Vercel

Before clicking Deploy, scroll down to **Environment Variables**:
- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://YOUR-RAILWAY-URL.railway.app` ← paste your Railway URL from Step 3d

Click **Deploy**.

Vercel builds and deploys in ~2 minutes. You'll get a URL like:
**https://rewear-ai.vercel.app** 🎉

---

## STEP 5 — Fix CORS (Backend Security)

After deployment, update `main.py` to only allow your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://rewear-ai.vercel.app",  # ← your actual Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push — Railway auto-redeploys.

---

## Alternative: Deploy Backend on Render (Also Free)

If Railway's credits run out, use Render:

1. Go to **https://render.com** → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your `rewear-ai` repo
4. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Instance Type**: Free
5. Add environment variable: `GROQ_API_KEY = gsk_...`
6. Click **Create Web Service**

> Note: Render free tier **spins down after 15 min of inactivity** (cold start ~30s).
> Railway is better for consistent usage.

---

## Testing the Full Flow

1. Open your Vercel URL
2. Upload any clothing photo (take a photo of a shirt, jeans, anything)
3. Click **Analyze this garment**
4. See: garment type, damage detection, severity badge
5. Switch between **Repair it** and **Restyle it** tabs
6. Get repair steps + outfit ideas

---

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| `CORS error` in browser | Update `allow_origins` in `main.py` with your Vercel URL |
| `502 Bad Gateway` | Check GROQ_API_KEY is set correctly in Railway variables |
| `Model returned invalid JSON` | Retry — occasionally the model formats oddly |
| Railway deployment fails | Make sure Root Directory is set to `backend` |
| Vercel build fails | Make sure Root Directory is set to `frontend` |
| Groq rate limit error | Free tier: 6,000 tokens/min. Wait 60s and retry |

---

## Free Tier Limits Summary

| Service | Free Limit | Notes |
|---------|------------|-------|
| Groq API | 6,000 tokens/min | Resets every minute, no card needed |
| Railway | $5 credit/month | ~500 hours of runtime |
| Render | 750 hours/month | Spins down when idle |
| Vercel | Unlimited hobby | 100GB bandwidth/month |

---

## Next Features to Add

1. **History** — save past analyses to localStorage or Supabase (free tier)
2. **Share** — generate a shareable link for each analysis
3. **Urdu language support** — add a language toggle, pass `language: "urdu"` in the prompt
4. **WhatsApp integration** — use Twilio free tier to send repair steps via WhatsApp
5. **Similar items marketplace** — link to ThredUp/Vinted API for upcycled alternatives

