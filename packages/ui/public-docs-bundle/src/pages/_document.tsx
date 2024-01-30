import { Head, Html, Main, NextScript } from "next/document";
import { ReactElement } from "react";

export default function NextDocument(): ReactElement {
    return (
        <Html lang="en" suppressHydrationWarning>
            <Head />
            <body className="antialiased">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
