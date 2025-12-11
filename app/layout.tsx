import type { Metadata } from "next";
import { gagalin, newYorker, garet, garetBold } from "./fonts";
import "./globals.css";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://quotesnewsletter.com";

export const metadata: Metadata = {
  title: "Quotes Newsletter",
  description: "Daily dose of inspiration.",
  openGraph: {
    title: "Quotes Newsletter",
    description:
      "Your daily dose of inspiration — one uplifting quote in your inbox every morning.",
    url: APP_URL,
    siteName: "Quotes Newsletter",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${gagalin.variable} ${newYorker.variable} ${garetBold.variable}`}
    >
      <body className={`${garet.variable} antialiased`}>{children}</body>
    </html>
  );
}
