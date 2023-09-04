import { ThemeProvider } from "@fern-ui/theme";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { setupFontAwesomeIcons } from "../setup-icons";
import "../styles/globals.css";

setupFontAwesomeIcons();

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
