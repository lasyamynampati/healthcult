import { AppShell } from "@/components/layout/AppShell";
import { RiskTrendChart } from "@/components/charts/RiskTrendChart";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <h2 className="text-lg font-semibold">Advanced Analytics</h2>
      <p className="text-sm">Risk trend charts and cohort views.</p>
      <div className="mt-4">
        <RiskTrendChart />
      </div>
    </AppShell>
  );
}
