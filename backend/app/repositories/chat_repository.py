from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import ChatMessage, ChatSession


class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_session(self, patient_id) -> ChatSession:
        session = ChatSession(patient_id=patient_id)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def add_message(self, session_id, sender: str, content: str, safety_labels: dict | None = None) -> ChatMessage:
        msg = ChatMessage(session_id=session_id, sender=sender, content=content, safety_labels=safety_labels or {})
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def list_messages(self, session_id, limit: int = 200) -> list[ChatMessage]:
        stmt = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

