from datetime import datetime


HIGH_RISK_KEYWORDS = [
    "chest pain",
    "shortness of breath",
    "sudden numbness",
    "fainting",
    "cannot breathe",
    "can't breathe",
    "suicide",
    "kill myself",
    "self harm",
    "stroke",
    "seizure",
    "overdose",
    "fainted",
    "unconscious",
    "severe bleeding",
    "heart attack",
]

MEDICAL_LIMIT_KEYWORDS = [
    "diagnose me",
    "what medicine should i take",
    "what drug should i take",
    "prescribe",
    "dosage",
    "am i having a heart attack",
    "is this cancer",
    "should i stop my medicine",
]

DISCLAIMER = (
    "I am an AI assistant providing educational guidance, not a substitute for professional medical diagnosis or emergency care."
)


def detect_high_risk(message: str) -> tuple[bool, str | None]:
    text = message.lower().strip()

    for keyword in HIGH_RISK_KEYWORDS:
        if keyword in text:
            return True, f"High-risk phrase detected: {keyword}"

    return False, None


def detect_out_of_scope_medical_advice(message: str) -> tuple[bool, str | None]:
    text = message.lower().strip()

    for keyword in MEDICAL_LIMIT_KEYWORDS:
        if keyword in text:
            return True, f"Out-of-scope medical advice request detected: {keyword}"

    return False, None


def build_safe_reply(message: str, context_type: str | None = "general") -> str:
    text = message.lower().strip()

    if context_type == "prediction":
        return (
            "I am the HealthCult Clinical Assistant. I explain risk scores using model-informed feature contributions, "
            "not medical diagnosis.\n\n"
            "- **Primary drivers:** BMI, Glucose, Blood Pressure, and age for diabetes risk.\n"
            "- **What this means:** A moderate or high score represents elevated likelihood, not certainty.\n"
            "- **Next step:** Review the counterfactual panel and share results with your clinician."
        )

    if context_type == "ocr":
        return (
            "I am the HealthCult Clinical Assistant. I can help interpret extracted report values and compare them to standard reference ranges.\n\n"
            "- **Cholesterol:** values over 200 mg/dL are generally above desirable range.\n"
            "- **Glucose:** fasting levels under 100 mg/dL are usually normal.\n"
            "- Always confirm the original report values before acting."
        )

    if "risk score" in text or "moderate" in text or "high risk" in text:
        return (
            "Your risk appears moderate primarily due to your reported BMI and Glucose levels. "
            "These factors are often the strongest drivers in diabetes risk models.\n\n"
            "- **BMI:** higher values increase risk in the model.\n"
            "- **Glucose:** elevated sugar values usually raise the risk probability.\n"
            "- Use the what-if suggestions to see the most influential changes."
        )

    if "diabetes" in text:
        return (
            "Diabetes risk assessments emphasize glucose control, BMI, insulin-related markers, and age.\n\n"
            "- **Focus on:** glucose, BMI, blood pressure, and insulin levels.\n"
            "- **Why it matters:** those features strongly affect the prediction model.\n"
            "- **Next step:** review counterfactual suggestions and discuss them with your care team."
        )

    if "heart" in text:
        return (
            "Heart disease risk uses blood pressure, cholesterol, exercise capacity, and chest pain indicators.\n\n"
            "- **Focus on:** LDL/HDL, blood pressure, activity level, and chest discomfort.\n"
            "- **What it means:** the prediction is a screening estimate, not a diagnosis.\n"
            "- **Next step:** consider clinical follow-up such as a stress test if values remain concerning."
        )

    if "ocr" in text or "report" in text:
        return (
            "OCR-extracted report values should be interpreted in context.\n\n"
            "- **Confirm:** compare the extracted numbers to your original report.\n"
            "- **Interpretation:** values like cholesterol, glucose, and blood pressure have standard ranges.\n"
            "- **Recommendation:** review any abnormal values with a clinician."
        )

    if "next step" in text or "should i" in text or "what do i do" in text:
        return (
            "I can provide preventive guidance and explain model results, but I am not a substitute for clinical care.\n\n"
            "- Identify your main concern.\n"
            "- Provide evidence-based preventive advice.\n"
            "- Suggest specific next steps such as follow-up testing or clinician review.\n\n"
            "For example, consult a cardiologist for a stress test if you are concerned about heart-related symptoms."
        )

    return (
        "I am the HealthCult Clinical Assistant. I provide professional, empathetic preventive healthcare guidance and explain medical report values.\n\n"
        "- I do not diagnose conditions or prescribe medications.\n"
        "- I explain what findings mean and suggest next steps.\n"
        "- If you mention chest pain, shortness of breath, sudden numbness, or fainting, I will advise urgent care immediately."
    )


def generate_chat_response(message: str, context_type: str | None = "general") -> dict:
    high_risk, high_risk_reason = detect_high_risk(message)
    if high_risk:
        return {
            "reply": (
                "Your message may describe a medical emergency or immediate safety concern. "
                "Please seek urgent medical help now. If symptoms are severe or worsening, contact local emergency services "
                "or go to the nearest emergency department immediately."
            ),
            "safe": False,
            "escalated": True,
            "escalation_reason": high_risk_reason,
            "disclaimer": DISCLAIMER,
            "suggested_action": "Escalate to emergency services or urgent clinician review immediately.",
            "created_at": datetime.utcnow(),
        }

    out_of_scope, out_of_scope_reason = detect_out_of_scope_medical_advice(message)
    if out_of_scope:
        return {
            "reply": (
                "I can’t provide diagnosis, medication selection, prescription guidance, or treatment decisions. "
                "Please consult a licensed clinician for medical advice tailored to your symptoms, history, and medications."
            ),
            "safe": False,
            "escalated": True,
            "escalation_reason": out_of_scope_reason,
            "disclaimer": DISCLAIMER,
            "suggested_action": "Refer this question to a qualified doctor or clinician.",
            "created_at": datetime.utcnow(),
        }

    return {
        "reply": build_safe_reply(message, context_type=context_type),
        "safe": True,
        "escalated": False,
        "escalation_reason": None,
        "disclaimer": DISCLAIMER,
        "suggested_action": "Use this as educational guidance and verify clinical decisions with a professional.",
        "created_at": datetime.utcnow(),
    }