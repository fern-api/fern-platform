import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

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

  // TODO get pathname
  // TODO change TTL in auth0
  if (pathname !== "/") {
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
          <ReactQueryProvider>{content}</ReactQueryProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
