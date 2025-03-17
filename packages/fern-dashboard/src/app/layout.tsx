import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fern Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-[calc(100dvh)] antialiased">{children}</body>
    </html>
  );
}
