import { AppShell } from "@/components/layout/AppShell";

export default function AdminOverviewPage() {
  return (
    <AppShell>
      <h2 className="text-lg font-semibold">Admin Overview</h2>
      <p className="text-sm">Usage, model health, queue status, and audit summaries.</p>
    </AppShell>
  );
}
