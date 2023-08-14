import { ThemeProvider } from "@fern-ui/theme";
import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

interface PageComponent {
    theme?: string;
}

export default function App({ Component, pageProps }: AppProps & { Component: PageComponent }): JSX.Element {
    return (
        <ThemeProvider forcedTheme={Component.theme ?? undefined}>
            <>
                <Head>
                    <title>Documentation</title>
                </Head>
                <Component {...pageProps} />
            </>
        </ThemeProvider>
    );
}
