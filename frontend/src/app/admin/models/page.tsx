import { AppShell } from "@/components/layout/AppShell";

export default function AdminModelsPage() {
  return (
    <AppShell>
      <h2 className="text-lg font-semibold">Model Monitoring</h2>
      <p className="text-sm">Performance, drift signals, and version metrics.</p>
    </AppShell>
  );
}
