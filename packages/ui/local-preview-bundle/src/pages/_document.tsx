import { Head, Html, Main, NextScript } from "next/document";
import { ReactElement } from "react";

export default function Document(): ReactElement {
    return (
        <Html lang="en" suppressHydrationWarning>
            <Head />
            <body className="overscroll-y-auto">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
