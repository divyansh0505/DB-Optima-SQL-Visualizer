"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { Header } from "@/components/ui/Header";
import { SchemaPanel } from "@/components/schema/SchemaPanel";
import { Workbench } from "@/components/ui/Workbench";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkSession } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkSession();
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-transparent border-t-[var(--accent)] rounded-full animate-spin" />
          <p className="text-xs text-[var(--muted)] animate-pulse">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 border-2 border-transparent border-t-[var(--accent)] rounded-full animate-spin" />
          <p className="text-xs text-[var(--muted)]">Redirecting to login…</p>
          <a href="/login" className="text-xs text-[var(--accent)] underline mt-2">Click here if not redirected</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex flex-1 min-h-0 overflow-hidden" style={{ background: "var(--bg)" }}>
        <SchemaPanel />
        <Workbench />
      </main>
    </div>
  );
}