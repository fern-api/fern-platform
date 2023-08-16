import { Head, Html, Main, NextScript } from "next/document";

export default function Document(): JSX.Element {
    return (
        <Html lang="en">
            <Head />
            <body
                className="bg-background overscroll-y-none"
                style={{
                    backgroundImage: "var(--docs-background-image)",
                    backgroundSize: "cover",
                }}
            >
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
