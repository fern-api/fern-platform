import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { getAuth0Client } from "@/app/services/auth0/auth0";
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
          <ReactQueryProvider>{content}</ReactQueryProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
