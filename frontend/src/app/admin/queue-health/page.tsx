import { AppShell } from "@/components/layout/AppShell";

export default function AdminQueueHealthPage() {
  return (
    <AppShell>
      <h2 className="text-lg font-semibold">Queue Health</h2>
      <p className="text-sm">Celery worker queues and retry/failure monitoring.</p>
    </AppShell>
  );
}
