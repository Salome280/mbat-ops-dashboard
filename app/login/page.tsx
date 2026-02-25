"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "mbat_access_granted_v1";

export default function AccessPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasAccess = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  }, []);

  if (hasAccess) {
    router.replace("/");
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter the access code.");
      return;
    }

    // Verify code via API so the secret never sits in the browser
    const res = await fetch("/api/access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: trimmed })
    });

    const data = (await res.json()) as { ok: boolean };

    if (!data.ok) {
      setError("Incorrect access code.");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, "true");
    router.replace("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-base font-semibold text-gray-900">
          MBAT Operations Dashboard
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          Enter the access code to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Access code
            </label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              type="password"
              placeholder="Enter code"
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
            className="flex w-full items-center justify-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-800"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}