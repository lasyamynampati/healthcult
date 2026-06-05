# HealthCult Architecture

## High-level design
- Frontend: Next.js app for patient, clinician, and admin experiences.
- Backend: FastAPI API with modular domain routers.
- Data: PostgreSQL for transactional and analytics snapshots.
- Async: Celery workers + Redis broker/result backend.
- AI/ML: Risk prediction, explainability, chatbot orchestration, and OCR extraction pipelines.

## Domain modules
- Auth and role-based access.
- Predictions (diabetes and heart disease).
- Counterfactual explanations.
- Chat decision support with safety guardrails.
- OCR report processing.
- Analytics and admin operations.

## Deployment
- Docker Compose for local dev.
- Managed cloud services for production-like Postgres, Redis, and object storage.
