import { AppShell } from "@/components/layout/AppShell";
import { use } from "react";

export default function ClinicianPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell>
      <h2 className="text-lg font-semibold">Patient Case: {id}</h2>
      <p className="text-sm">Case review, reports, and recommendation history.</p>
    </AppShell>
  );
}
