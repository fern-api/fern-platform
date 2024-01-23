import { SpeedInsights } from "@vercel/speed-insights/next";
import { Head, Html, Main, NextScript } from "next/document";
import { ReactElement } from "react";

export function NextDocument(): ReactElement {
    return (
        <Html lang="en" suppressHydrationWarning>
            <Head />
            <body className="antialiased">
                <Main />
                <NextScript />
                <SpeedInsights />
            </body>
        </Html>
    );
}
