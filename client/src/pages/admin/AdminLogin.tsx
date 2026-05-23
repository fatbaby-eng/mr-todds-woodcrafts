import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const utils = trpc.useUtils();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Login failed (${res.status})`);
        setSubmitting(false);
        return;
      }
      await utils.auth.me.invalidate();
      setLocation("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1008] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-[#2A1810] border border-[#3D2418] rounded-lg p-8 space-y-6"
      >
        <div className="text-center">
          <h1
            className="font-cinzel text-[#C9A227] text-2xl mb-2"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Admin Sign In
          </h1>
          <p className="text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
            Mr. Todd's Workshop
          </p>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-[#8D6E63]">
              Username
            </span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full bg-[#1A1008] border border-[#3D2418] rounded px-3 py-2 text-[#F5F0EB] focus:outline-none focus:border-[#C9A227]"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-[#8D6E63]">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full bg-[#1A1008] border border-[#3D2418] rounded px-3 py-2 text-[#F5F0EB] focus:outline-none focus:border-[#C9A227]"
            />
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#C9A227] text-[#1A1008] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#D4B03A] transition-colors disabled:opacity-50"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
