"use client";

import { useState } from "react";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSendToday() {
    try {
      const res = await fetch("/api/send-today", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("send-today error response:", data);
        alert(data?.error ?? "Erro ao enviar newsletter");
        return;
      }

      console.log("send-today response", data);
      alert(`Newsletter enviada! (${data.sent ?? 0} inscrito(s))`);
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar newsletter (veja o console e o terminal)");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Erro ao enviar");

      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
        <h1 className="text-2xl font-semibold mb-2">Quotes Newsletter </h1>

        <p className="text-sm text-slate-300 mb-4">
          Receive an inspiring phrase daily directly in your email. No spam,
          just a moment of respite ✨
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
            className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>

        {status === "success" && (
          <p className="mt-3 text-xs text-emerald-400">
            🎉 You have subscribed! Stay tuned...
          </p>
        )}
        {status === "error" && (
          <p className="mt-3 text-xs text-red-400">
            Error subscribing. Try again later!
          </p>
        )}

        <button
          type="button"
          onClick={handleSendToday}
          className="mt-4 w-full py-2 rounded-lg text-xs text-slate-300 border border-slate-600 hover:bg-slate-800 transition"
        >
          Enviar newsletter de hoje (dev)
        </button>
      </div>
    </main>
  );
}
