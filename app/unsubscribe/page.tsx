"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gagalin, garet, garetBold } from "../fonts";

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
    <main
      className="min-h-screen flex flex-col items-center text-slate-900 px-4 pt-4 pb-0"
      style={{
        backgroundImage: "url('/typewriter.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#75564d",
        backgroundBlendMode: "luminosity",
      }}
    >
      <div className="header flex self-center md:self-start gap-2">
        <Image
          src="/logo-beige-blue.png"
          alt="Quotes Newsletter logo"
          width={256}
          height={130}
        />
      </div>

      <div className="flex flex-col items-center justify-center p-4">
        <h1
          className={`${garetBold.className} text-[#f8eade] text-3xl md:text-5xl text-center mb-5 [text-shadow:0_0_1px_#402d21,0_0_2px_#402d21,0_0_3px_#402d21]`}
        >
          Leaving the newsletter?
        </h1>

        <h2
          className={`${garet.className} text-[#f8eade] text-xl md:text-2xl text-center max-w-xl leading-relaxed mb-10 [text-shadow:0_0_1px_#402d21,0_0_2px_#402d21,0_0_3px_#402d21]`}
        >
          Enter your email below and we&apos;ll stop sending your daily quotes.
          <br /> No hard feelings — your inbox, your rules. 💌
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center px-10 md:px-20 pb-10 md:pb-20 pt-10 text-[#f8eade] bg-[#75564d]/70 border-2 border-[#402d21] rounded-t-[50px] flex-1 rounded-b-none gap-10">
        <h3
          className={`${garet.className} [text-shadow:0_0_1px_#402d21,0_0_2px_#402d21,0_0_3px_#402d21] text-md md:text-xl`}
        >
          &quot;There is no real ending. It&apos;s just the place where you stop
          the story.&quot; - Frank Herbert
        </h3>
        <div className="max-w-lg w-full p-8 rounded-[50px] bg-[#402d21] border border-[#75564d]">
          <h2
            className={`${gagalin.className} text-2xl sm:text-4xl font-semibold mb-4 text-center text-[#f8eade] [text-shadow:0_0_1px_#402d21,0_0_2px_#402d21,0_0_3px_#402d21]`}
          >
            Unsubscribe
          </h2>

          <p className={`${garet.className} text-md text-[#f8eade] mb-4`}>
            If you no longer want to receive our daily quote emails, just add
            your email below and we&apos;ll remove you from the list.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${garetBold.className} w-full px-3 py-2 rounded-lg text-[#402d21] bg-[#f8eade] border border-[#402d21] text-sm outline-none focus:ring-2 focus:ring-[#fefaf8]`}
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className={`${garetBold.className} w-full py-2 px-4 rounded-lg cursor-pointer text-[#f8eade] text-sm font-medium bg-[#6f8ca4] border border-[#6f8ca4] hover:bg-[#203a58] disabled:opacity-60 disabled:cursor-not-allowed transition [text-shadow:0_0_1px_#402d21,0_0_2px_#402d21,0_0_3px_#402d21]`}
            >
              {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
            </button>
          </form>

          {status === "success" && (
            <p className={`${garet.className} mt-3 text-xs text-emerald-400`}>
              ✅ You have been unsubscribed. You will no longer receive daily
              quotes.
            </p>
          )}

          {status === "error" && (
            <p className={`${garet.className} mt-3 text-xs text-red-400`}>
              {errorMessage || "Failed to unsubscribe. Please try again."}
            </p>
          )}

          <p className={`${garet.className} mt-6 text-[13px] text-[#f8eade]`}>
            Changed your mind? You can subscribe again on the{" "}
            <Link
              href="/"
              className="underline text-[#f8eade] hover:text-[#fefaf8]"
            >
              homepage
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
