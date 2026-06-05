# HealthCult — Deployment Guide

## Quick Start (Local Development)

### 1. Backend

```bash
cd healthcult_advanced

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS

# Install dependencies
pip install -r backend/requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your SECRET_KEY, DATABASE_URL, ALLOWED_ORIGINS

# Train ML models (first time only)
python ml/training/train_real_models.py

# Start the backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8005
```

### 2. Frontend

```bash
cd healthcult_advanced/frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.local.example .env.local
# Edit .env.local with your backend URL

# Start the frontend
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Required Environment Variables

### Backend (`.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SECRET_KEY` | ✅ | JWT signing key | `my-strong-random-key-abc123` |
| `DATABASE_URL` | ✅ | Database connection | `sqlite:///./healthcult.db` |
| `ALLOWED_ORIGINS` | ✅ | CORS origins (comma-separated) | `http://localhost:3000` |
| `DEBUG` | ❌ | Enable debug mode | `False` |
| `APP_ENV` | ❌ | Environment name | `production` |

### Frontend (`.env.local`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL | `https://api.yourdomain.com` |

---

## Production Deployment

### Backend

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn + Uvicorn workers
gunicorn backend.app.main:app \
  -k uvicorn.workers.UvicornWorker \
  -w 4 \
  -b 0.0.0.0:8000
```

Production `.env`:
```
APP_ENV=production
DEBUG=False
SECRET_KEY=<strong-random-key>
DATABASE_URL=postgresql://user:pass@db-host:5432/healthcult
ALLOWED_ORIGINS=https://yourdomain.com
```

### Frontend

```bash
cd frontend

# Build for production
npm run build

# Start production server
npm run start
```

Production `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Docker

```bash
# Backend
cd backend
docker build -t healthcult-api .
docker run -p 8000:8000 --env-file ../.env healthcult-api

# Frontend
cd frontend
docker build -t healthcult-web .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com healthcult-web
```

---

## Production Checklist

- [ ] Set `SECRET_KEY` to a strong random value (not the dev default)
- [ ] Set `DEBUG=False`
- [ ] Set `ALLOWED_ORIGINS` to your actual frontend domain only
- [ ] Set `DATABASE_URL` to a real PostgreSQL connection
- [ ] Set `NEXT_PUBLIC_API_URL` to your real backend URL
- [ ] Run `python ml/training/train_real_models.py` to generate model artifacts
- [ ] Verify `ml/artifacts/diabetes_model.pkl` and `heart_model.pkl` exist
- [ ] Run smoke tests: `python test_smoke.py`
- [ ] Run pytest: `pytest backend/tests -v`

---

## API Endpoints Summary

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/ready` | No | DB readiness |
| POST | `/api/v1/auth/register` | No | Create account |
| POST | `/api/v1/auth/login` | No | Get JWT token |
| GET | `/api/v1/users/me` | Yes | Current user |
| POST | `/api/v1/predictions/diabetes` | Yes | Diabetes risk prediction |
| POST | `/api/v1/predictions/heart` | Yes | Heart disease prediction |
| POST | `/api/v1/chat/` | Yes | Chat with AI assistant |
| GET | `/docs` | No | Swagger UI |
