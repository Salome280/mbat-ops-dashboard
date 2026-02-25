"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { isEmailAllowed } from "@/lib/allowedEmails";
import { completeSignInFromLink, isMagicLink, sendMagicLink } from "@/lib/auth";

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "message" in err) {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [checkingLink, setCheckingLink] = useState(true);

  useEffect(() => {
    // If the user is already signed in, go straight to the dashboard.
    const unsub = auth.onAuthStateChanged(user => {
      if (user && isEmailAllowed(user.email)) {
        router.replace("/");
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : undefined;

    if (!url || !isMagicLink(url)) {
      setCheckingLink(false);
      return;
    }

    (async () => {
      try {
        await completeSignInFromLink(url);
        router.replace("/");
      } catch (err) {
        console.error("Magic link error:", err);
        setError(getErrorMessage(err));
        setCheckingLink(false);
      }
    })();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }

    if (!isEmailAllowed(trimmed)) {
      setError("This email is not authorized to access the MBAT Operations Dashboard.");
      return;
    }

    try {
      setSending(true);
      await sendMagicLink(trimmed);
      setSent(true);
      setInfo("Magic sign-in link sent. Check your inbox and open the link on this device.");
    } catch (err) {
      console.error("Magic link error:", err);
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
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
            <p className="text-xs text-gray-500">Internal access · localhost only</p>
          </div>
        </div>

        <h1 className="text-base font-semibold text-gray-900">Sign in with magic link</h1>
        <p className="mt-1 text-xs text-gray-500">
          Enter your approved email address. We&apos;ll email you a one-time sign-in link. No passwords, no public signup.
        </p>

        {checkingLink && (
          <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Completing secure sign-in link…
          </div>
        )}

        {!checkingLink && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@hec.edu"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-accent/30 focus:border-accent focus:ring-2"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={sending || sent}
              className="flex w-full items-center justify-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sending ? "Sending link…" : sent ? "Link sent" : "Send magic link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-[11px] text-gray-400">
          By signing in you confirm this device is secure and used only for MBAT operations.
        </p>
      </div>
    </div>
  );
}