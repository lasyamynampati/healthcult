const modelTypeEl = document.getElementById("model-type");
const diabetesFields = document.getElementById("diabetes-fields");
const heartFields = document.getElementById("heart-fields");
const form = document.getElementById("prediction-form");
const resultCard = document.getElementById("result-card");
const explanationBtn = document.getElementById("explanation-btn");
const counterfactualBtn = document.getElementById("counterfactual-btn");
const explanationOutput = document.getElementById("explanation-output");
const counterfactualOutput = document.getElementById("counterfactual-output");
const historyOutput = document.getElementById("history-output");
const loadHistoryBtn = document.getElementById("load-history-btn");
const patientIdEl = document.getElementById("patient-id");

const uploadForm = document.getElementById("document-upload-form");
const uploadPatientIdEl = document.getElementById("upload-patient-id");
const docTypeEl = document.getElementById("doc-type");
const reportFileEl = document.getElementById("report-file");
const uploadStatusEl = document.getElementById("upload-status");
const ocrOutputEl = document.getElementById("ocr-output");

const chatForm = document.getElementById("chat-form");
const chatOutput = document.getElementById("chat-output");
const chatMessageEl = document.getElementById("chat-message");
const chatContextEl = document.getElementById("chat-context");

let latestAssessmentId = null;
let latestDocumentId = null;

function toggleModelFields() {
    const model = modelTypeEl.value;
    if (model === "diabetes") {
        diabetesFields.classList.remove("hidden");
        heartFields.classList.add("hidden");
    } else {
        heartFields.classList.remove("hidden");
        diabetesFields.classList.add("hidden");
    }
}

function getDiabetesFeatures() {
    return {
        pregnancies: Number(document.getElementById("pregnancies").value),
        glucose: Number(document.getElementById("glucose").value),
        blood_pressure: Number(document.getElementById("blood_pressure").value),
        skin_thickness: Number(document.getElementById("skin_thickness").value),
        insulin: Number(document.getElementById("insulin").value),
        bmi: Number(document.getElementById("bmi").value),
        diabetes_pedigree_function: Number(document.getElementById("diabetes_pedigree_function").value),
        age: Number(document.getElementById("diabetes_age").value),
    };
}

function getHeartFeatures() {
    return {
        age: Number(document.getElementById("heart_age").value),
        sex: Number(document.getElementById("sex").value),
        cp: Number(document.getElementById("cp").value),
        trestbps: Number(document.getElementById("trestbps").value),
        chol: Number(document.getElementById("chol").value),
        fbs: Number(document.getElementById("fbs").value),
        restecg: Number(document.getElementById("restecg").value),
        thalach: Number(document.getElementById("thalach").value),
        exang: Number(document.getElementById("exang").value),
        oldpeak: Number(document.getElementById("oldpeak").value),
        slope: Number(document.getElementById("slope").value),
        ca: Number(document.getElementById("ca").value),
        thal: Number(document.getElementById("thal").value),
    };
}

function getBadgeClass(riskBand) {
    const band = (riskBand || "").toLowerCase();
    if (band.includes("high")) return "high";
    if (band.includes("medium")) return "medium";
    return "low";
}

function renderResult(data) {
    const badgeClass = getBadgeClass(data.risk_band);
    resultCard.classList.remove("empty-state");
    resultCard.innerHTML = `
        <div class="result-meta">
            <div class="metric"><strong>Assessment ID</strong><span>${data.id}</span></div>
            <div class="metric"><strong>Model</strong><span>${data.model_type}</span></div>
            <div class="metric"><strong>Version</strong><span>${data.model_version}</span></div>
            <div class="metric"><strong>Risk Score</strong><span>${data.risk_score}</span></div>
            <div class="metric"><strong>Risk Band</strong><span class="badge ${badgeClass}">${data.risk_band}</span></div>
        </div>
    `;
}

function renderHistory(items) {
    if (!items || items.length === 0) {
        historyOutput.className = "history-list empty-state";
        historyOutput.innerHTML = "<p>No history found.</p>";
        return;
    }

    historyOutput.className = "history-list";
    historyOutput.innerHTML = items.map(item => `
        <div class="history-item">
            <h4>${item.model_type} • ${item.risk_band}</h4>
            <p><strong>Assessment:</strong> ${item.id}</p>
            <p><strong>Score:</strong> ${item.risk_score}</p>
            <p><strong>Version:</strong> ${item.model_version}</p>
            <p><strong>Created:</strong> ${item.created_at}</p>
        </div>
    `).join("");
}

function appendChatMessage(role, text, variant = "") {
    const div = document.createElement("div");
    div.className = `chat-message ${role} ${variant}`.trim();
    div.innerHTML = `<strong>${role === "user" ? "You" : "Assistant"}:</strong> <span>${text}</span>`;
    chatOutput.appendChild(div);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

async function runPrediction(event) {
    event.preventDefault();

    const modelType = modelTypeEl.value;
    const patientId = patientIdEl.value.trim();
    const features = modelType === "diabetes" ? getDiabetesFeatures() : getHeartFeatures();

    const payload = {
        patient_id: patientId,
        features: features,
    };

    try {
        const response = await fetch(`/api/v1/predictions/${modelType}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Prediction failed");
        }

        latestAssessmentId = data.id;
        renderResult(data);
        explanationBtn.disabled = false;
        counterfactualBtn.disabled = false;
        explanationOutput.textContent = "No explanation loaded.";
        counterfactualOutput.textContent = "No counterfactuals loaded.";
    } catch (error) {
        resultCard.className = "result-card empty-state";
        resultCard.innerHTML = `<p>${error.message}</p>`;
        explanationBtn.disabled = true;
        counterfactualBtn.disabled = true;
    }
}

async function loadHistory() {
    const patientId = patientIdEl.value.trim();
    if (!patientId) {
        historyOutput.className = "history-list empty-state";
        historyOutput.innerHTML = "<p>Enter a patient ID first.</p>";
        return;
    }

    try {
        const response = await fetch(`/api/v1/predictions/history/${patientId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to load history");
        }

        renderHistory(data.items || []);
    } catch (error) {
        historyOutput.className = "history-list empty-state";
        historyOutput.innerHTML = `<p>${error.message}</p>`;
    }
}

async function loadExplanation() {
    if (!latestAssessmentId) return;

    try {
        const response = await fetch(`/api/v1/predictions/${latestAssessmentId}/explanations`, {
            method: "POST",
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to load explanation");
        }

        explanationOutput.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        explanationOutput.textContent = error.message;
    }
}

async function loadCounterfactuals() {
    if (!latestAssessmentId) return;

    try {
        const response = await fetch(`/api/v1/predictions/${latestAssessmentId}/counterfactuals`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                target_outcome: "reduce_risk_to_low",
                max_suggestions: 3,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to load counterfactuals");
        }

        counterfactualOutput.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        counterfactualOutput.textContent = error.message;
    }
}

async function uploadDocument(event) {
    event.preventDefault();

    const patientId = uploadPatientIdEl.value.trim();
    const docType = docTypeEl.value.trim();
    const file = reportFileEl.files[0];

    if (!patientId || !file) {
        uploadStatusEl.textContent = "Patient ID and file are required.";
        return;
    }

    const formData = new FormData();
    formData.append("patient_id", patientId);
    formData.append("doc_type", docType);
    formData.append("file", file);

    try {
        uploadStatusEl.textContent = "Uploading document...";
        const response = await fetch("/api/v1/documents/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Upload failed");
        }

        latestDocumentId = data.id;
        uploadStatusEl.textContent = `Uploaded document ${data.id}. Fetching OCR result...`;

        setTimeout(async () => {
            await loadOCRResult();
        }, 1200);
    } catch (error) {
        uploadStatusEl.textContent = error.message;
    }
}

async function loadOCRResult() {
    if (!latestDocumentId) {
        ocrOutputEl.textContent = "No document uploaded yet.";
        return;
    }

    try {
        const response = await fetch(`/api/v1/documents/${latestDocumentId}/ocr`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to load OCR result");
        }

        ocrOutputEl.textContent = JSON.stringify(data, null, 2);
        uploadStatusEl.textContent = `OCR ${data.status} for document ${latestDocumentId}`;
    } catch (error) {
        ocrOutputEl.textContent = error.message;
    }
}

async function sendChatMessage(event) {
    event.preventDefault();

    const message = chatMessageEl.value.trim();
    const contextType = chatContextEl.value;

    if (!message) return;

    appendChatMessage("user", message);
    chatMessageEl.value = "";

    try {
        const response = await fetch("/api/v1/chat/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                patient_id: patientIdEl ? patientIdEl.value.trim() || null : null,
                message: message,
                context_type: contextType,
                assessment_id: latestAssessmentId,
                document_id: latestDocumentId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Chat request failed");
        }

        const variant = data.escalated ? "alert" : "";
        appendChatMessage("assistant", `${data.reply}\n\nDisclaimer: ${data.disclaimer}`, variant);
    } catch (error) {
        appendChatMessage("assistant", error.message, "alert");
    }
}

modelTypeEl.addEventListener("change", toggleModelFields);
form.addEventListener("submit", runPrediction);
loadHistoryBtn.addEventListener("click", loadHistory);
explanationBtn.addEventListener("click", loadExplanation);
counterfactualBtn.addEventListener("click", loadCounterfactuals);
uploadForm.addEventListener("submit", uploadDocument);
chatForm.addEventListener("submit", sendChatMessage);

toggleModelFields();