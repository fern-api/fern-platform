import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { getAuth0Client } from "@/utils/auth0";

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

  const auth0 = await getAuth0Client();
  const session = await auth0.getSession();
  if (session != null) {
    content = (
      <ProtectedRoute>
        <AppLayout>{children}</AppLayout>
      </ProtectedRoute>
    );
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
