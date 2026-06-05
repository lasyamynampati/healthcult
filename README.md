# HealthCult Advanced
Advanced AI-powered healthcare risk prediction and clinical decision support platform.

## Monorepo layout
- `frontend/`: Next.js patient, clinician, and admin apps.
- `backend/`: FastAPI API, services, tasks, and tests.
- `infra/`: environment templates and container orchestration.
- `docs/`: architecture, API, security, and runbooks.
- `ml/`: model training/evaluation structure.

## Local run (Docker)
1. Run `docker-compose up --build`.
2. API health: `http://localhost:8000/health`
3. Frontend: `http://localhost:3000`

## Optional verification commands
- Check API health: `curl http://localhost:8000/health`
- View logs: `docker-compose logs -f [service-name]`
- Stop services: `docker-compose down`

## Key capabilities scaffolded
- Authentication and roles API surface.
- Diabetes and heart prediction endpoints.
- Counterfactual generation endpoint.
- Chatbot route with safety escalation guardrails.
- OCR pipeline stubs and Celery queue setup.
- Analytics and admin route scaffolding.