import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.db.types import GUID


JSON_TYPE = JSON().with_variant(JSONB(), "postgresql")


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="patient")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    consents = relationship("Consent", back_populates="user")
    created_assessments = relationship(
        "RiskAssessment",
        back_populates="creator",
        foreign_keys="RiskAssessment.created_by",
    )
    reset_tokens = relationship("PasswordResetToken", back_populates="user")


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    sex: Mapped[str] = mapped_column(String(20), nullable=True)
    phone: Mapped[str] = mapped_column(String(30), nullable=True)
    region: Mapped[str] = mapped_column(String(80), nullable=True)
    consent_version: Mapped[str] = mapped_column(String(40), nullable=True)

    user = relationship("User", back_populates="profile")


class Consent(Base, TimestampMixin):
    __tablename__ = "consents"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    consent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    purpose: Mapped[str] = mapped_column(String(80), nullable=False)
    granted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="consents")


class Patient(Base, TimestampMixin):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    clinician_owner_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    external_ref: Mapped[str] = mapped_column(String(80), index=True, nullable=True)

    assessments = relationship(
        "RiskAssessment",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    chat_sessions = relationship(
        "ChatSession",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    documents = relationship(
        "Document",
        back_populates="patient",
        cascade="all, delete-orphan",
    )


class RiskAssessment(Base, TimestampMixin):
    __tablename__ = "risk_assessments"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("patients.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    model_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    model_version: Mapped[str] = mapped_column(String(30), nullable=False, default="v1")
    input_snapshot: Mapped[dict] = mapped_column(JSON_TYPE, nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_band: Mapped[str] = mapped_column(String(30), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    patient = relationship("Patient", back_populates="assessments")
    creator = relationship(
        "User",
        back_populates="created_assessments",
        foreign_keys=[created_by],
    )
    explanations = relationship(
        "ModelExplanation",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )
    counterfactual_runs = relationship(
        "CounterfactualRun",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )


class ModelExplanation(Base, TimestampMixin):
    __tablename__ = "model_explanations"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("risk_assessments.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    method: Mapped[str] = mapped_column(String(30), nullable=False)
    explanation: Mapped[dict] = mapped_column(JSON_TYPE, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    assessment = relationship("RiskAssessment", back_populates="explanations")


class CounterfactualRun(Base, TimestampMixin):
    __tablename__ = "counterfactual_runs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("risk_assessments.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    target_outcome: Mapped[str] = mapped_column(String(50), nullable=False)
    suggestions: Mapped[dict] = mapped_column(JSON_TYPE, nullable=False)
    feasibility_score: Mapped[float] = mapped_column(Float, nullable=False)

    assessment = relationship(
        "RiskAssessment",
        back_populates="counterfactual_runs",
    )


class ChatSession(Base, TimestampMixin):
    __tablename__ = "chat_sessions"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("patients.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    escalation_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    patient = relationship("Patient", back_populates="chat_sessions")
    messages = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class ChatMessage(Base, TimestampMixin):
    __tablename__ = "chat_messages"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    sender: Mapped[str] = mapped_column(String(30), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    safety_labels: Mapped[dict] = mapped_column(JSON_TYPE, default=dict, nullable=False)

    session = relationship("ChatSession", back_populates="messages")


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("patients.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    storage_uri: Mapped[str] = mapped_column(String(512), nullable=False)
    doc_type: Mapped[str] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="uploaded", nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="documents")
    ocr_jobs = relationship(
        "OCRJob",
        back_populates="document",
        cascade="all, delete-orphan",
    )
    report_entities = relationship(
        "ReportEntity",
        back_populates="document",
        cascade="all, delete-orphan",
    )


class OCRJob(Base, TimestampMixin):
    __tablename__ = "ocr_jobs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("documents.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    task_id: Mapped[str] = mapped_column(String(80), index=True, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="queued", nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=True)
    parsed: Mapped[dict] = mapped_column(JSON_TYPE, nullable=True)
    confidence: Mapped[dict] = mapped_column(JSON_TYPE, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    document = relationship("Document", back_populates="ocr_jobs")


class ReportEntity(Base, TimestampMixin):
    __tablename__ = "report_entities"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("documents.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_name: Mapped[str] = mapped_column(String(120), nullable=False)
    value: Mapped[str] = mapped_column(String(120), nullable=False)
    unit: Mapped[str] = mapped_column(String(40), nullable=True)
    reference_range: Mapped[str] = mapped_column(String(80), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=True)

    document = relationship("Document", back_populates="report_entities")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    actor_user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    action: Mapped[str] = mapped_column(String(80), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(80), nullable=False)
    resource_id: Mapped[uuid.UUID] = mapped_column(GUID(), index=True, nullable=True)
    purpose: Mapped[str] = mapped_column(String(80), nullable=True)
    ip_hash: Mapped[str] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class PasswordResetToken(Base, TimestampMixin):
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)
    used_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="reset_tokens")


Index("ix_audit_logs_resource", AuditLog.resource_type, AuditLog.resource_id)