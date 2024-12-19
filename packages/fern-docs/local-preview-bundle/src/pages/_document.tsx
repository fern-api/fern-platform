import { Head, Html, Main, NextScript } from "next/document";
import { ReactElement } from "react";

export default function NextDocument(): ReactElement {
    return (
        <Html lang="en" suppressHydrationWarning>
            <Head>
                <link
                    href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
                    rel="stylesheet"
                />
            </Head>
            <body className="antialiased">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
