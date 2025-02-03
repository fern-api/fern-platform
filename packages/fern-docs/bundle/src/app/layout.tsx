"use server";

import "@/client/css/globals.scss";
import { Metadata, Viewport } from "next";
import StyledJsxRegistry from "./registry";

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
}: {
  children: React.ReactNode;
}) {
  // const domain = getDocsDomainApp();
  // const docs = await cachedLoadWithUrl(domain);

  // const theme = !docs.ok
  //   ? "default"
  //   : // TODO: make this configurable
  //     docs.body.baseUrl.domain.includes("cohere")
  //     ? "cohere"
  //     : "default";

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
          <main>{children}</main>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
