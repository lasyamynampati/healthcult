# Data Dictionary (Initial)

## Primary tables
- `users`: account identity and role.
- `risk_assessments`: model outputs and input snapshots.
- `counterfactual_runs`: feasible change suggestions for outcome targets.
- `chat_sessions` / `chat_messages`: chatbot conversation trails and safety labels.
- `documents` / `ocr_jobs` / `report_entities`: OCR ingestion lifecycle and extracted values.
- `audit_logs`: compliance and traceability events.

## Data handling notes
- Use UUID keys for globally unique records.
- Use JSONB for flexible model and OCR payload fields.
- Retention and deletion workflows are required for DPDP alignment.
