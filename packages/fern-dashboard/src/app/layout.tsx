import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { getSession } from "@auth0/nextjs-auth0";
import { UserProvider } from "@auth0/nextjs-auth0/client";

import { AppLayout } from "@/components/AppLayout";

import { gtPlanar } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fern Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.JSX.Element;
}>) {
  let content = children;

  const session = await getSession();
  if (session != null) {
    content = <AppLayout session={session}>{children}</AppLayout>;
  }

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
            {content}
          </ThemeProvider>
        </body>
      </UserProvider>
    </html>
  );
}
