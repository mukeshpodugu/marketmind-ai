# MarketMind AI – Intelligent Stock Prediction and Market Analytics Platform

MarketMind AI is a production-grade, AI-powered financial intelligence and stock market forecasting dashboard. The platform incorporates deep sequence models (LSTM, GRU, Bi-LSTM) and classical regressors (Linear Regression, Random Forests, XGBoost) side-by-side to predict futures price curves, backed by FinBERT NLP sentiment analysis of market news headlines.

---

## 👨‍💻 Developer Information
* **Developer Name:** PODUGU MUKESH
* **Email:** [mukeshpodugu123@gmail.com](mailto:mukeshpodugu123@gmail.com)
* **Phone:** 8143999463
* **Location:** Srikakulam
* **Portfolio Display Scope:** About Us page, Contact Support desk, Footer details, Profile settings, Documentation sheets, and README.

---

## 🌐 Live Deployment Links
* **Frontend Web Application (Vercel):** [https://marketmind-a64bzn6je-podugu-mukeshs-projects.vercel.app](https://marketmind-a64bzn6je-podugu-mukeshs-projects.vercel.app)
* **Backend REST API (Render):** [https://marketmind-ai-vbot.onrender.com](https://marketmind-ai-vbot.onrender.com)

---

## 🔑 Admin Credentials & Registration
The platform supports role-based access control (RBAC). Admin credentials are dynamically assigned:
* **Admin Privilege Escalation**: To register an administrator account, simply sign up with **any username containing `"admin"`** (e.g., `admin_mukesh`, `admin`, `mukesh_admin`).
* **Example Admin Account**:
  * **Username**: `admin_mukesh` (or any username containing `admin`)
  * **Password**: *Chosen by you during registration* (e.g. `mukesh123` or your preferred password)
* **Note**: If the database is completely empty/reset, the very first user who registers on the signup page (regardless of their username) is automatically granted full **Admin** privileges.

---

## 🏛️ Platform Architecture & Folder Structure

MarketMind AI leverages a decoupled three-tier architecture:
1. **Frontend:** React SPA built with Vite, styled using Tailwind CSS, and graphed with Recharts.
2. **Backend:** FastAPI REST APIs using SQLAlchemy ORM.
3. **Services:** PostgreSQL database, Redis caching, PyTorch sequence engines, and ReportLab / openpyxl report builders.

### Folder Structure
```
marketmind-ai/
├── docker-compose.yml          # Orchestration configuration
├── README.md                   # Platform documentation
├── backend/                    # Python FastAPI workspace
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── run.py                  # Startup entry point
│   ├── test_app.py             # Pytest suite
│   └── app/
│       ├── main.py             # ASGI application initialization
│       ├── config.py           # Configuration & fallback database settings
│       ├── api/                # Route endpoints (auth, stocks, predictions...)
│       ├── db/                 # SQL schemas and session connections
│       ├── ml/                 # Data pipelines, PyTorch models, FinBERT, XAI
│       └── services/           # PDF (ReportLab) & Excel exporter utilities
└── frontend/                   # React Vite workspace
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.js      # Styling configuration
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx             # Routing setup
        ├── index.css           # Custom scrollbars & glassmorphism components
        ├── context/            # AuthContext & ThemeContext
        ├── services/           # Fetch API client wrappers
        ├── components/         # Reusable layouts, sidebar, stat cards, charts
        └── pages/              # Dashboards, predictors, portfolio, support...
```

---

## 📊 Database ER Schema (PostgreSQL)

The platform implements the following relational database tables:
* **Users:** Handles logins, hashes, and roles (`admin`, `user`, `guest`).
* **Stocks:** Tracks ticker symbols, sector names, and updates.
* **Watchlists:** Maps user preferences to watched stock tickers.
* **Portfolios & Holdings:** Manages transaction lots (shares, buy prices, purchase dates) for calculations.
* **Predictions:** Archives historical predictions to monitor model drift and accuracy.
* **NewsArticles & SentimentScores:** Stores retrieved articles, scores, and FinBERT sentiment classifications.
* **Reports:** Files log metadata for Excel/PDF exports.
* **ActivityLogs:** Audit logs of critical actions (logins, orders, forecasts).

---

## 🧠 Machine Learning & Explainable AI (XAI) Pipeline

1. **Market Data Pipeline:** Downloads historical bars via yfinance. Auto-calculates technical indicators: Simple Moving Average (SMA), Exponential Moving Average (EMA), Relative Strength Index (RSI), MACD, Bollinger Bands, Stochastic Oscillator, and Volatility.
2. **Evaluation Engine:** Splits data into 80% train and 20% test. Trains six distinct models (Linear Regression, Random Forest, XGBoost, LSTM, GRU, Bi-LSTM) to forecast target horizons (Next Day, Week, Month, Quarter). Selects the best-performing model based on the lowest test RMSE.
3. **Explainable AI (XAI):** Calculates SHAP-style technical factor importances (RSI bounds, Moving Average crossovers, volatility trends) to display top prediction drivers in a visual horizontal bar chart.
4. **Sentiment Analysis:** Classifies news sentiment using FinBERT (`ProsusAI/finbert`). Falls back to a local keyword-based financial lexicon analyzer when running offline.

---

## 🚀 Installation & Local Startup

### Option A: Quick Startup using Docker Compose (Recommended)
Ensure Docker is installed and running on your system, then execute:
```bash
# Build and start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up --build
```
* **Frontend Access:** [http://localhost:5173](http://localhost:5173)
* **Backend Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Option B: Local Manual Setup (Without Docker)
#### 1. Backend Startup
```bash
cd backend
python -m venv venv
# Windows PowerShell activation:
.\venv\Scripts\Activate.ps1
# Install packages
pip install -r requirements.txt
# Run ASGI server (default fallbacks to SQLite and local memory cache if Postgres/Redis are offline)
python run.py
```

#### 2. Frontend Startup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Running Automated Tests

Run the backend unit tests to verify data pipelines, indicators calculations, and authentication flows:
```bash
cd backend
pytest -v
```

---

## 📝 Resume-Ready Project Description

**MarketMind AI – Intelligent Stock Prediction & Financial Analytics Platform**
* Developed a production-grade fintech dashboard utilizing a decoupled three-tier architecture (FastAPI + React/Vite + PostgreSQL + Redis) to deliver stock analytics and predictive forecasts.
* Implemented a machine learning model selection pipeline evaluating six models (LSTM, GRU, Bi-LSTM in PyTorch; XGBoost, Random Forest, Linear Regression in Scikit-Learn) on historical time-series data, achieving dynamic forecasts for Next Day, Week, Month, and Quarter horizons.
* Integrated FinBERT NLP model to analyze financial news headlines, computing a Market Mood Index with a fallback to a rule-based lexicon analyzer for offline execution.
* Structured relational PostgreSQL database tables with SQLAlchemy ORM, including SQLite fallback handlers, and designed a custom portfolio performance service to calculate aggregate returns and asset allocations.
* Designed a premium glassmorphic dashboard styled with Tailwind CSS, utilizing Recharts for forecast confidence intervals, and added ReportLab/openpyxl services to compile exportable PDF/Excel briefs.
