import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

interface PageComponent {
    theme?: string;
}

type Theme = "dark" | "light";

const DEFAULT_THEME: Theme = "dark";
const THEMES: Theme[] = ["dark", "light"];

export default function App({ Component, pageProps }: AppProps & { Component: PageComponent }): JSX.Element {
    return (
        <ThemeProvider
            defaultTheme={DEFAULT_THEME}
            forcedTheme={Component.theme ?? undefined}
            enableSystem={false}
            themes={THEMES}
            attribute="class"
        >
            <>
                <Head>
                    <title>Documentation</title>
                </Head>
                <Component {...pageProps} />
            </>
        </ThemeProvider>
    );
}
