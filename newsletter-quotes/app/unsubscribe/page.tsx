"use client";

import { useState } from "react";
import Link from "next/link";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          typeof data?.error === "string"
            ? data.error
            : "Failed to unsubscribe. Please try again."
        );
        return;
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Unexpected error. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
        <h1 className="text-2xl font-semibold mb-2">
          Unsubscribe from Quotes Newsletter
        </h1>

        <p className="text-sm text-slate-300 mb-4">
          If you no longer want to receive our daily quote emails, enter your
          email address below and we will remove you from the list.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="youremail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
          </button>
        </form>

        {status === "success" && (
          <p className="mt-3 text-xs text-emerald-400">
            ✅ You have been unsubscribed. You will no longer receive daily
            quotes.
          </p>
        )}

        {status === "error" && (
          <p className="mt-3 text-xs text-red-400">
            {errorMessage || "Failed to unsubscribe. Please try again."}
          </p>
        )}

        <p className="mt-6 text-[11px] text-slate-500">
          Changed your mind? You can subscribe again on the{" "}
          <Link
            href="/"
            className="underline text-slate-300 hover:text-slate-100"
          >
            homepage
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
