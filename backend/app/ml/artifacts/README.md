# Model Artifacts Contract

Expected prediction artifacts:

- `diabetes_model.pkl`
- `heart_model.pkl`

Accepted search locations (in order):

1. `backend/app/ml/artifacts/`
2. `ml/artifacts/`

Each artifact must be a pickled Python `dict` with:

- `model`: object implementing `predict_proba()` or `predict()`
- optional `model_version`: string (defaults to `v1` if omitted)
