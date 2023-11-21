import { Head, Html, Main, NextScript } from "next/document";
import { ReactElement } from "react";

export default function Document(): ReactElement {
    return (
        <Html lang="en">
            <Head />
            <body className="overscroll-y-none">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
