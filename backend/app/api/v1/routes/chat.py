from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import generate_chat_response

router = APIRouter(tags=["chat"])


@router.post("/", response_model=ChatResponse)
def chat_with_assistant(payload: ChatRequest):
    response = generate_chat_response(
        message=payload.message,
        context_type=payload.context_type,
    )
    return response