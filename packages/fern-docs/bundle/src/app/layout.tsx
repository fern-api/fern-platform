"use server";

import "@/client/css/globals.scss";
import StyledJsxRegistry from "@/components/registry";
import { Metadata, Viewport } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { generator: "Fern Docs" };
}

export async function generateViewport(): Promise<Viewport> {
  return {
    width: "device-width",
    height: "device-height",
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: true,
  };
}

export default async function RootLayout({
  children,
  header,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <StyledJsxRegistry>
          {header}
          {children}
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
