import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Login failed");
        return;
      }
      setLocation("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1008] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-[#0F0A05] border border-[#2D1A0E] rounded-lg p-8 space-y-6"
      >
        <div className="text-center">
          <p
            className="text-[#C9A227] font-cinzel text-xs tracking-[0.2em] uppercase"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Mr. Todd&apos;s Woodcrafts
          </p>
          <h1
            className="text-[#F5F0EB] font-cinzel text-2xl mt-1"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Admin Sign-In
          </h1>
        </div>

        <label
          className="block text-xs text-[#8D6E63] uppercase tracking-widest"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Password
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full bg-[#1A1008] border border-[#2D1A0E] text-[#F5F0EB] rounded px-3 py-2 focus:outline-none focus:border-[#C9A227]"
          />
        </label>

        {error && (
          <p
            className="text-red-400 text-sm"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || password.length === 0}
          className="w-full px-4 py-3 bg-[#C9A227] text-[#1A1008] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#D4B03A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
