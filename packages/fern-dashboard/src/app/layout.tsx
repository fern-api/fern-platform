import type { Metadata } from "next";

import { UserProvider } from "@auth0/nextjs-auth0/client";

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
      <UserProvider>
        <body className="flex h-[calc(100dvh)] antialiased">{children}</body>
      </UserProvider>
    </html>
  );
}
