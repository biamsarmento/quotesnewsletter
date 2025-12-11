// app/fonts.ts
import localFont from "next/font/local";

export const gagalin = localFont({
  src: "./fonts/Gagalin-Regular.otf",
  variable: "--font-gagalin",
  weight: "400",
});

export const newYorker = localFont({
  src: "./fonts/ACaslonPro-Regular.otf",
  variable: "--font-new-yorker",
  weight: "400",
});

export const garet = localFont({
  src: "./fonts/Spacetype-GaretBook.otf",
  variable: "--font-garet",
  weight: "400",
});

export const garetBold = localFont({
  src: "./fonts/Spacetype-GaretHeavy.otf",
  variable: "--font-garet-bold",
});
