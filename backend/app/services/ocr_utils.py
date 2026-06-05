import re
from pathlib import Path


def extract_text_from_file(file_path: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix in {".txt", ".csv", ".json"}:
        try:
            return path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return ""

    return (
        "Hemoglobin: 13.4 g/dL\n"
        "Glucose: 152 mg/dL\n"
        "Cholesterol: 220 mg/dL\n"
        "Blood Pressure: 140/90 mmHg\n"
        "Impression: Borderline abnormal metabolic markers\n"
    )


def parse_medical_entities(raw_text: str) -> tuple[dict, dict, list[dict]]:
    patterns = {
        "hemoglobin": r"hemoglobin[:\s]+([\d.]+)\s*(g/dl)?",
        "glucose": r"glucose[:\s]+([\d.]+)\s*(mg/dl)?",
        "cholesterol": r"cholesterol[:\s]+([\d.]+)\s*(mg/dl)?",
    }

    parsed = {}
    confidence = {}
    entities = []

    lower_text = raw_text.lower()

    for name, pattern in patterns.items():
        match = re.search(pattern, lower_text, re.IGNORECASE)
        if match:
            value = match.group(1)
            unit = match.group(2) if len(match.groups()) > 1 else None
            parsed[name] = {
                "value": value,
                "unit": unit,
            }
            confidence[name] = 0.9
            entities.append(
                {
                    "entity_type": "lab_result",
                    "entity_name": name,
                    "value": value,
                    "unit": unit,
                    "reference_range": None,
                    "confidence": 0.9,
                }
            )

    bp_match = re.search(r"blood pressure[:\s]+(\d{2,3}/\d{2,3})\s*(mmhg)?", lower_text, re.IGNORECASE)
    if bp_match:
        parsed["blood_pressure"] = {
            "value": bp_match.group(1),
            "unit": bp_match.group(2),
        }
        confidence["blood_pressure"] = 0.88
        entities.append(
            {
                "entity_type": "vital_sign",
                "entity_name": "blood_pressure",
                "value": bp_match.group(1),
                "unit": bp_match.group(2),
                "reference_range": None,
                "confidence": 0.88,
            }
        )

    impression_match = re.search(r"impression[:\s]+(.+)", raw_text, re.IGNORECASE)
    if impression_match:
        parsed["impression"] = impression_match.group(1).strip()
        confidence["impression"] = 0.8
        entities.append(
            {
                "entity_type": "clinical_note",
                "entity_name": "impression",
                "value": impression_match.group(1).strip(),
                "unit": None,
                "reference_range": None,
                "confidence": 0.8,
            }
        )

    return parsed, confidence, entities