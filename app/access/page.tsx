"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const verifyRes = await fetch("/api/access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() })
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.ok) {
        setError("Incorrect passcode. Please try again.");
        setSubmitting(false);
        return;
      }

      await fetch("/api/access/grant", { method: "POST" });

      if (typeof window !== "undefined") {
        window.localStorage.setItem("mbat_access_granted_v1", "true");
      }

      router.replace("/");
    } catch (err) {
      console.error("Access verification error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
            MB
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">MBAT Operations</p>
            <p className="text-xs text-gray-500">Internal dashboard</p>
          </div>
        </div>

        <h1 className="text-base font-semibold text-gray-900">Enter passcode</h1>
        <p className="mt-1 text-xs text-gray-500">
          Enter the shared passcode to access the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Passcode
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter passcode"
              autoComplete="off"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-accent/30 focus:border-accent focus:ring-2"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Verifying…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
