EMERGENCY_KEYWORDS = {"chest pain", "fainting", "severe breathlessness", "stroke", "suicidal"}


def apply_safety_guardrails(message: str) -> tuple[str, list[str], bool]:
    lowered = message.lower()
    labels: list[str] = []
    escalated = False

    for kw in EMERGENCY_KEYWORDS:
        if kw in lowered:
            labels.append("emergency_signal")
            escalated = True
            break

    return message.strip(), labels, escalated
