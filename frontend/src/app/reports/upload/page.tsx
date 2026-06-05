"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AppShell } from "@/components/layout/AppShell";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface DocumentResponse {
  id: string;
  patient_id: string;
  storage_uri: string;
  doc_type: string | null;
  status: string;
  uploaded_at: string;
}

interface OCRJob {
  id: string;
  document_id: string;
  task_id: string | null;
  status: string;
  raw_text: string | null;
  parsed: Record<string, any> | null;
  confidence: Record<string, number> | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function UploadReportPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<DocumentResponse | null>(null);
  const [ocrJob, setOcrJob] = useState<OCRJob | null>(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await apiFetch<Patient[]>("/patients");
      setPatients(data);
    } catch (err) {
      setError("Failed to load patients");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedPatientId || !selectedFile) {
      setError("Please select a patient and file");
      return;
    }

    setUploading(true);
    setError("");
    setUploadResult(null);
    setOcrJob(null);

    try {
      const formData = new FormData();
      formData.append("patient_id", selectedPatientId);
      formData.append("file", selectedFile);
      if (docType) formData.append("doc_type", docType);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005"}/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("hc_token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      const result: DocumentResponse = await response.json();
      setUploadResult(result);

      // Start polling for OCR results
      pollOCRResult(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const pollOCRResult = async (documentId: string) => {
    setPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        const job: OCRJob = await apiFetch(`/documents/${documentId}/ocr`);
        setOcrJob(job);

        if (job.status === "completed" || job.status === "failed") {
          clearInterval(pollInterval);
          setPolling(false);
        }
      } catch (err) {
        // Job might not be created yet, keep polling
      }
    }, 2000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
    }, 120000);
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            OCR Document Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload medical reports for automatic text extraction and analysis
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Document</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="">Select a patient...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Document Type</label>
                <input
                  type="text"
                  placeholder="e.g., lab_report, imaging, prescription"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">File</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedPatientId || !selectedFile}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Upload & Process"}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {uploadResult && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Upload Status</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Document ID:</strong> {uploadResult.id}</p>
                  <p><strong>Status:</strong> {uploadResult.status}</p>
                  <p><strong>Uploaded:</strong> {new Date(uploadResult.uploaded_at).toLocaleString()}</p>
                </div>
              </Card>
            )}

            {polling && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Processing OCR</h2>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Extracting text and analyzing...</span>
                </div>
              </Card>
            )}

            {ocrJob && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">OCR Results</h2>

                <div className="space-y-4">
                  <div className="text-sm">
                    <p><strong>Status:</strong> {ocrJob.status}</p>
                    {ocrJob.completed_at && (
                      <p><strong>Completed:</strong> {new Date(ocrJob.completed_at).toLocaleString()}</p>
                    )}
                  </div>

                  {ocrJob.status === "completed" && ocrJob.raw_text && (
                    <>
                      <div>
                        <h3 className="font-medium mb-2">Extracted Text</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {ocrJob.raw_text}
                        </div>
                      </div>

                      {ocrJob.parsed && Object.keys(ocrJob.parsed).length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Parsed Medical Data</h3>
                          <div className="space-y-2">
                            {Object.entries(ocrJob.parsed).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                                <span>{value.value || value} {value.unit || ''}</span>
                                {ocrJob.confidence?.[key] && (
                                  <span className="text-xs text-gray-500">
                                    ({Math.round(ocrJob.confidence[key] * 100)}% confidence)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {ocrJob.status === "failed" && (
                    <div className="text-red-600 dark:text-red-400">
                      OCR processing failed. Please try again.
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
