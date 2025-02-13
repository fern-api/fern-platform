/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { NextThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fern AI Analytics",
  description: "Triage your AI conversations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: any;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextThemeProvider>
          <Theme>{children}</Theme>
        </NextThemeProvider>
      </body>
    </html>
  );
}
