import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { UserProvider } from "@auth0/nextjs-auth0/client";

import { gtPlanar } from "./fonts";
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
    <html lang="en" suppressHydrationWarning className={gtPlanar.className}>
      <UserProvider>
        <body className="flex h-[calc(100dvh)] antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </UserProvider>
    </html>
  );
}
