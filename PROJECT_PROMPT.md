# HealthCult Advanced

Build a full-stack web application called HealthCult, an AI-powered preventive healthcare and clinical decision support platform focused on diabetes and heart disease risk assessment, intelligent user guidance, medical report scanning, explainable analytics, and administrative monitoring.

## Recommended tech stack
- Frontend: Next.js with React
- Styling/UI: Tailwind CSS
- Backend API: FastAPI
- Database: PostgreSQL
- ORM / DB layer: SQLAlchemy + Alembic
- Background jobs: Celery + Redis
- ML models: scikit-learn / XGBoost / LightGBM
- Explainability: SHAP
- OCR / scanner: OpenCV + Tesseract or PaddleOCR
- Visual analytics: Plotly / ECharts / Recharts
- AI layer: LLM API integration with project-aware guidance and safety guardrails
- Deployment: Docker + Docker Compose

## Core features
- User authentication and role-based access
- Diabetes risk prediction
- Heart disease risk prediction
- Counterfactual suggestions
- Personalized health guidance
- Fully working clinical decision support chatbot
- Working OCR-based scanner page for reports
- Prediction history and report history
- Advanced visual analytics dashboards
- Admin analytics portal
- Audit logs and chatbot/report analytics

## Architecture expectations
- Next.js frontend
- FastAPI backend
- PostgreSQL database
- Redis + Celery for async tasks
- ML service layer
- OCR pipeline
- Analytics layer
- Chatbot layer with safety rules
- Docker-based setup

## Safety
- The chatbot should guide and assist, but not claim to replace licensed doctors.
- Include disclaimers and urgent escalation advice where necessary.