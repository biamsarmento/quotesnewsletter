"use client";

import { useState } from "react";
import Image from "next/image";
import { gagalin, garet, garetBold } from "./fonts";
import Link from "next/link";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Error subscribing");

      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
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
          Your daily dose of inspiration...
        </h1>

        <h2
          className={`${garet.className} text-[#f8eade] text-xl md:text-2xl text-center max-w-xl leading-relaxed mb-15 [text-shadow:0_0_1px_#402d21,0_0_2px_#402d21,0_0_3px_#402d21]`}
        >
          A simple, uplifting newsletter that delivers one inspiring quote to
          your inbox every day. <br /> No clutter, no noise—just a gentle spark
          to start your day with purpose.
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center px-10 md:px-20 pb-10 md:pb-20 pt-10 text-[#f8eade] bg-[#75564d]/70 border-2 border-[#402d21] rounded-t-[50px] flex-1 rounded-b-none gap-10">
        <h3
          className={`${garet.className} [text-shadow:0_0_1px_#402d21,0_0_2px_#402d21,0_0_3px_#402d21] text-md md:text-xl`}
        >
          &quot;The best way to get started is to quit talking and begin
          doing.&quot; - Walt Disney
        </h3>
        <div className="subscribe flex flex-col mb-10">
          <div className="max-w-lg w-full p-8 rounded-[50px] bg-[#402d21] border border-[#75564d]">
            <h1
              className={`${gagalin.className} text-2xl sm:text-4xl font-semibold mb-4 justify-self-center text-[#f8eade] [text-shadow:0_0_1px_#402d21,0_0_2px_#402d21,0_0_3px_#402d21]`}
            >
              Subscribe
            </h1>

            <p className={`${garet.className} text-md text-[#f8eade] mb-4`}>
              Receive an inspiring phrase daily directly in your email. <br />
              No spam, no fee — just a moment of respite ✨
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
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            {status === "success" && (
              <p className={`${garet.className} mt-3 text-xs text-emerald-400`}>
                🎉 You have been subscribed! Stay tuned for your first quote...
              </p>
            )}
            {status === "error" && (
              <p className={`${garet.className} mt-3 text-xs text-red-400`}>
                Error subscribing. Try again later!
              </p>
            )}
          </div>
        </div>
        <Link href="/unsubscribe" className="mt-3 block">
          <button
            type="button"
            className={`${garetBold.className} w-full py-2 px-4 rounded-lg text-lg font-medium cursor-pointer bg-[#402d21] text-[#f8eade] hover:bg-[#f8eade] hover:text-[#402d21] border border-[#402d21] transition`}
          >
            Unsubscribe
          </button>
        </Link>
      </div>
    </main>
  );
}
