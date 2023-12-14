import { ThemeProvider } from "@fern-ui/ui";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { AppProps } from "next/app";
import { ReactElement } from "react";
import { setupFontAwesomeIcons } from "../setup-icons";
import "../styles/globals.css";
import { Docs } from "./[host]/[[...slug]]";

setupFontAwesomeIcons();

export default function App({ Component, pageProps }: AppProps<Partial<Docs.Props>>): ReactElement {
    const theme = pageProps.docs?.definition.config.colorsV3.type;
    return (
        <ThemeProvider theme={theme}>
            <Component {...pageProps} />
        </ThemeProvider>
    );
}
