import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { AppLayout } from "@/components/AppLayout";
import { auth0 } from "@/lib/auth0";

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

  const session = await auth0.getSession();
  if (session != null) {
    content = <AppLayout session={session}>{children}</AppLayout>;
  }

  return (
    <html lang="en" suppressHydrationWarning className={gtPlanar.className}>
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
    </html>
  );
}
