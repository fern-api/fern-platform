import { Head, Html, Main, NextScript } from "next/document";

export default function Document(): JSX.Element {
    return (
        <Html lang="en">
            <Head />
            <body
                className="dark:bg-background bg-backgroundSecondary overscroll-y-none"
                style={{
                    backgroundImage: "var(--docs-background-image, url('/backgrounds/default.png'))",
                    backgroundSize: "cover",
                }}
            >
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
