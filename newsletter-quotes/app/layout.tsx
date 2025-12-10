import type { Metadata } from "next";
import { gagalin, newYorker, garet, garetBold } from "./fonts";
import "./globals.css";

// const gagalin = localFont({
//   src: "./fonts/Gagalin-Regular.otf",
//   variable: "--font-gagalin",
//   weight: "400",
// });

// const newYorker = localFont({
//   src: "./fonts/ACaslonPro-Regular.otf",
//   variable: "--font-new-yorker",
//   weight: "400",
// });

// const garet = localFont({
//   src: "./fonts/Spacetype-GaretBook.otf",
//   variable: "--font-garet",
//   weight: "400",
// });

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
