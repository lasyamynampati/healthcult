from fastapi import APIRouter

from app.api.v1.routes import admin, analytics, auth, chat, consents, counterfactuals, documents, patients, predictions, reports, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(consents.router, prefix="/consents", tags=["consents"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
api_router.include_router(counterfactuals.router, prefix="/counterfactuals", tags=["counterfactuals"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
