import "@fortawesome/fontawesome-svg-core/styles.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { AppProps } from "next/app";
import { ReactElement } from "react";
import { ThemeProvider } from "../docs/ThemeProvider";
import { setupFontAwesomeIcons } from "../util/setupFontAwesomeIcons";
import { DocsPage } from "./DocsPage";
import "./globals.css";

setupFontAwesomeIcons();

export function NextApp({ Component, pageProps }: AppProps<Partial<DocsPage.Props>>): ReactElement {
    const theme = pageProps.docs?.definition.config.colorsV3?.type;
    return (
        <ThemeProvider theme={theme}>
            <Component {...pageProps} />
            <SpeedInsights />
        </ThemeProvider>
    );
}
