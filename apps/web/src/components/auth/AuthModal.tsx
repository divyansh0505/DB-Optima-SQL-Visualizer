"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/useAuth";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

export function AuthModal() {
  const { isModalOpen, modalTab, closeAuthModal, setModalTab, login, signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (modalTab === "signin") {
      const res = await login({ email, password });
      if (!res.success) {
        setErrorMsg(res.error || "Sign in failed");
      } else {
        setName("");
        setEmail("");
        setPassword("");
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
        setName("");
        setEmail("");
        setPassword("");
      }
    }
    setIsSubmitting(false);
  };

  const handleTabChange = (tab: "signin" | "signup") => {
    setModalTab(tab);
    setErrorMsg(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border2)",
            boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5), 0 0 30px -10px var(--accent-soft)",
          }}
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] transition text-lg w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface2)]"
          >
            ✕
          </button>

          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 shadow-lg"
              style={{
                background: "linear-gradient(155deg, var(--accent), var(--accent-violet))",
              }}
            >
              ⚡
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[var(--text)]">
              {modalTab === "signin" ? "Welcome Back" : "Create your Account"}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              {modalTab === "signin"
                ? "Sign in to save queries and manage workspaces"
                : "Join DB Optima to share queries and track benchmarks"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div
            className="flex gap-1 p-1 rounded-xl mb-5"
            style={{
              background: "var(--surface3)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={() => handleTabChange("signin")}
              className="relative flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors z-[1]"
              style={{
                color: modalTab === "signin" ? "var(--accent)" : "var(--muted)",
              }}
            >
              {modalTab === "signin" && (
                <motion.div
                  layoutId="auth-tab-pill"
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
              onClick={() => handleTabChange("signup")}
              className="relative flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors z-[1]"
              style={{
                color: modalTab === "signup" ? "var(--accent)" : "var(--muted)",
              }}
            >
              {modalTab === "signup" && (
                <motion.div
                  layoutId="auth-tab-pill"
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

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {modalTab === "signup" && (
              <div>
                <label className="block text-[11px] font-medium text-[var(--muted)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input w-full !py-2 !text-xs"
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
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full !py-2 !text-xs"
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
                  placeholder={modalTab === "signup" ? "At least 6 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full !py-2 !pr-10 !text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)]"
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
                  <span>{modalTab === "signin" ? "Signing In…" : "Creating Account…"}</span>
                </>
              ) : (
                <span>{modalTab === "signin" ? "Sign In →" : "Create Account →"}</span>
              )}
            </motion.button>
          </form>

          {/* Footer toggle note */}
          <div className="mt-5 text-center text-xs text-[var(--muted)]">
            {modalTab === "signin" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("signup")}
                  className="text-[var(--accent)] hover:underline font-medium ml-1"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("signin")}
                  className="text-[var(--accent)] hover:underline font-medium ml-1"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
