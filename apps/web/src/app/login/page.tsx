"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkSession, login, signup } = useAuth();

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (tab === "signin") {
      const res = await login({ email, password });
      if (!res.success) {
        setErrorMsg(res.error || "Sign in failed");
      } else {
        router.push("/dashboard");
      }
    } else {
      if (!name.trim()) {
        setErrorMsg("Please enter your name");
        setIsSubmitting(false);
        return;
      }
      const res = await signup({ name, email, password });
      if (!res.success) {
        setErrorMsg(res.error || "Signup failed");
      } else {
        router.push("/dashboard");
      }
    }
    setIsSubmitting(false);
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const demoEmail = "demo@dboptima.io";
    const demoPass = "Demo1234!";

    // Try logging in as demo, or signup if it doesn't exist yet
    let res = await login({ email: demoEmail, password: demoPass });
    if (!res.success) {
      res = await signup({ name: "Demo Explorer", email: demoEmail, password: demoPass });
    }

    if (res.success) {
      router.push("/dashboard");
    } else {
      setErrorMsg(res.error || "Demo login failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* ── Left Hero Panel ── */}
      <div
        className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r"
        style={{
          background: "linear-gradient(145deg, var(--surface) 0%, var(--bg) 100%)",
          borderColor: "var(--border)",
        }}
      >
        {/* Glow ambient circle */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: "var(--accent)" }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
            style={{
              background: "linear-gradient(155deg, var(--accent), var(--accent-violet))",
            }}
          >
            ⚡
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">
              DB<span className="text-[var(--accent)]">Optima</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--success)]">
              Measured, Not Simulated
            </p>
          </div>
        </div>

        {/* Center Pitch */}
        <div className="relative z-10 my-10 lg:my-0 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border mb-4"
              style={{
                color: "var(--accent)",
                borderColor: "rgba(59,130,246,0.3)",
                background: "var(--accent-soft)",
              }}
            >
              <span>✦</span>
              <span>Next-Gen SQL Visualization & Optimization</span>
            </span>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text)] leading-tight mb-4">
              Master SQL Execution & Performance in Real Time.
            </h2>

            <p className="text-sm leading-relaxed text-[var(--muted)] mb-8">
              Run real SQLite WebAssembly in your browser. Watch animated relational pipeline joins, receive Gemini 2.5 Flash query optimizations, and benchmark queries up to 100K rows.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className="p-3 rounded-xl border flex items-start gap-2.5"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span className="text-base">⬡</span>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text)]">Step-by-Step Join Visuals</h4>
                  <p className="text-[11px] text-[var(--muted)]">Row-by-row nested loop join execution.</p>
                </div>
              </div>

              <div
                className="p-3 rounded-xl border flex items-start gap-2.5"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span className="text-base">✦</span>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text)]">Gemini AI Optimizer</h4>
                  <p className="text-[11px] text-[var(--muted)]">Grounded EXPLAIN plan rewrites & DDL indexes.</p>
                </div>
              </div>

              <div
                className="p-3 rounded-xl border flex items-start gap-2.5"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span className="text-base">◈</span>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text)]">100K Benchmarking</h4>
                  <p className="text-[11px] text-[var(--muted)]">Multi-volume Recharts latency curves.</p>
                </div>
              </div>

              <div
                className="p-3 rounded-xl border flex items-start gap-2.5"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span className="text-base">🔗</span>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text)]">Save & Share</h4>
                  <p className="text-[11px] text-[var(--muted)]">One-click snapshot links with full schema restoration.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} DB Optima. Real SQLite WASM Engine.
        </div>
      </div>

      {/* ── Right Auth Form Panel ── */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-2xl p-8 shadow-2xl relative"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border2)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 35px -10px var(--accent-soft)",
          }}
        >
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl font-bold tracking-tight text-[var(--text)]">
              {tab === "signin" ? "Sign In to DB Optima" : "Create your Account"}
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              {tab === "signin"
                ? "Enter your credentials to access your personalized workspace."
                : "Sign up in seconds to start optimizing and benchmarking queries."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div
            className="flex gap-1 p-1 rounded-xl mb-6"
            style={{
              background: "var(--surface3)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={() => { setTab("signin"); setErrorMsg(null); }}
              className="relative flex-1 py-2 text-xs font-semibold rounded-lg transition-colors z-[1]"
              style={{
                color: tab === "signin" ? "var(--accent)" : "var(--muted)",
              }}
            >
              {tab === "signin" && (
                <motion.div
                  layoutId="login-tab-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border2)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-[2]">Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setTab("signup"); setErrorMsg(null); }}
              className="relative flex-1 py-2 text-xs font-semibold rounded-lg transition-colors z-[1]"
              style={{
                color: tab === "signup" ? "var(--accent)" : "var(--muted)",
              }}
            >
              {tab === "signup" && (
                <motion.div
                  layoutId="login-tab-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border2)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-[2]">Sign Up</span>
            </button>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-lg text-xs flex items-center gap-2"
                style={{
                  color: "var(--error)",
                  background: "var(--error-soft)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <span>⚠</span>
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === "signup" && (
              <div>
                <label className="block text-[11px] font-medium text-[var(--muted)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input w-full !py-2.5 !text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[var(--muted)] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full !py-2.5 !text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--muted)] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={tab === "signup" ? "At least 6 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full !py-2.5 !pr-12 !text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full !py-2.5 !text-xs font-semibold mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-transparent border-t-white rounded-full animate-spin" />
                  <span>{tab === "signin" ? "Authenticating…" : "Creating Account…"}</span>
                </>
              ) : (
                <span>{tab === "signin" ? "Sign In →" : "Create Account →"}</span>
              )}
            </motion.button>

            {/* Quick Demo Access Button */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="border-t border-[var(--border)] w-full" />
              <span className="bg-[var(--surface)] px-2 text-[10px] uppercase tracking-wider text-[var(--muted)] absolute">
                or
              </span>
            </div>

            <motion.button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary w-full !py-2.5 !text-xs font-medium flex items-center justify-center gap-2"
              style={{
                borderColor: "var(--border2)",
                background: "var(--surface3)",
                color: "var(--text)",
              }}
            >
              <span>⚡</span>
              <span>Explore as Demo User</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
