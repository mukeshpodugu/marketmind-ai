# MarketMind AI – Deployment Guide

This guide details three production deployment options for **MarketMind AI**. Since we have fully configured Dockerfiles, docker-compose, and a decoupled architecture, you can deploy the platform for free or on a budget.

---

## Option A: One-Click Docker Deployment via Railway (easiest)
[Railway.app](https://railway.app) allows you to import your GitHub repository and automatically provisions databases, caching, backend containers, and frontends.

1. **Create a Railway Account:** Sign up using your GitHub account.
2. **New Project:** Click **New Project** -> **Deploy from GitHub repo**.
3. **Select Repository:** Choose `marketmind-ai`.
4. **Configure Services:**
   * Railway will detect both the `backend` and `frontend` folders.
   * **Database:** Click **Add Service** -> **PostgreSQL**.
   * **Cache:** Click **Add Service** -> **Redis**.
5. **Environment Variables:**
   * In your **Backend** service, add the following variables:
     * `POSTGRES_HOST`: `${{Postgres.DATABASE_URL}}` (Railway binds this automatically)
     * `REDIS_HOST`: `${{Redis.REDIS_HOST}}`
     * `SECRET_KEY`: `your_custom_jwt_security_key_here`
   * In your **Frontend** service, add:
     * `VITE_API_URL`: Your backend service's public domain (e.g., `https://marketmind-backend.up.railway.app/api/v1`)
6. **Deploy:** Click **Deploy**. Railway will build the containers, deploy the databases, and link them together.

---

## Option B: Render (Backend) + Vercel (Frontend) (100% Free Tier)
This separates the frontend static assets (Vercel) from the backend API services (Render) for maximum performance and cost efficiency.

### 1. Backend & DB Setup on Render
1. Go to [Render.com](https://render.com) and log in.
2. **Create Database:** Click **New** -> **PostgreSQL**. Name it `marketmind-db`.
3. **Create Backend Web Service:**
   * Click **New** -> **Web Service**.
   * Connect your `marketmind-ai` GitHub repository.
   * **Root Directory:** `backend`
   * **Language:** `Python`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables:** Under the "Env" tab in your Render Web Service, add:
   * `DATABASE_URL`: Copy the **Internal Database URL** from your newly created Render PostgreSQL service.
   * `SECRET_KEY`: `your_custom_jwt_security_key_here`
   * `REDIS_HOST`: (Optional) If you don't provision a Redis service, the backend will fall back to local caching automatically.

### 2. Frontend Setup on Vercel
1. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New** -> **Project** and import `marketmind-ai`.
3. **Configure Project:**
   * **Framework Preset:** Vite
   * **Root Directory:** `frontend`
4. **Environment Variables:** Add a new variable:
   * Key: `VITE_API_URL`
   * Value: Your Render backend public URL + `/api/v1` (e.g., `https://marketmind-api.onrender.com/api/v1`)
5. Click **Deploy**. Vercel will build and serve your frontend static assets on a CDN.

---

## Option C: Self-Hosted VPS (DigitalOcean / AWS EC2)
If deploying to a virtual private server with Docker installed:

1. **Clone Repo:**
   ```bash
   git clone https://github.com/mukeshpodugu/marketmind-ai.git
   cd marketmind-ai
   ```
2. **Build and Run Containers:**
   ```bash
   # Run in detached (background) mode
   docker-compose up -d --build
   ```
3. **Proxy Setup (Nginx):** Configure Nginx as a reverse proxy mapping port `80` to the frontend (`5173`) and `/api` requests to the backend (`8000`).
