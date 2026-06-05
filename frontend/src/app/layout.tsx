import "./globals.css";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const metadata = {
  title: "HealthCult — AI-Powered Preventive Healthcare",
  description:
    "Assess your diabetes and heart disease risk with explainable AI. Get actionable, plain-language guidance from real clinical models.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)] transition-colors duration-300">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
