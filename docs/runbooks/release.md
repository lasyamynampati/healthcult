# Release Runbook

## Pre-release checks
- Run backend tests and API smoke checks.
- Validate frontend route rendering and core flows.
- Verify Celery queue connectivity and beat schedules.
- Confirm migrations are applied in staging.
- Confirm DPDP controls and audit logging are active.

## Go-live checks
- Health endpoints for API and frontend.
- Queue health and worker status.
- Database connectivity and backup policy.
- Alerting channels configured for failures and anomalies.
