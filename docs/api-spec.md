# HealthCult API Spec (v1)

## Core routes
- Auth: `/api/v1/auth/*`
- User profile: `/api/v1/users/me`
- Consents: `/api/v1/consents/*`
- Predictions: `/api/v1/predictions/*`
- Counterfactuals: `/api/v1/counterfactuals/*`
- Chat: `/api/v1/chat/*`
- OCR Reports: `/api/v1/reports/*`
- Analytics: `/api/v1/analytics/*`
- Admin: `/api/v1/admin/*`

## Response principles
- JSON responses with explicit IDs and timestamps.
- Structured error responses with `detail` and request trace metadata.
- Safety-sensitive chatbot responses always include medical disclaimer context.
