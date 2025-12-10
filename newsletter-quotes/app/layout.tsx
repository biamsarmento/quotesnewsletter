import type { Metadata } from "next";
import { gagalin, newYorker, garet, garetBold } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quotes Newsletter",
  description: "Daily dose of inspiration.",
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
