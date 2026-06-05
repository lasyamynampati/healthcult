import { AppShell } from "@/components/layout/AppShell";

export default function MedicalDisclaimerPage() {
  return (
    <AppShell>
      <h2 className="text-lg font-semibold">Medical Disclaimer</h2>
      <p className="text-sm">
        HealthCult provides educational and decision-support guidance. It is not a replacement for
        licensed clinical diagnosis or treatment.
      </p>
    </AppShell>
  );
}
