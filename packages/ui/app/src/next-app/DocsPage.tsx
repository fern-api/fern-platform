import { useHydrateAtoms } from "jotai/utils";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { DOCS_ATOM, useMessageHandler, type DocsProps } from "../atoms";
import { BgImageGradient } from "../docs/BgImageGradient";
import { useBeforePopState } from "../hooks/useBeforePopState";
import { useConsoleMessage } from "../hooks/useConsoleMessage";
import { NextSeo } from "../seo/NextSeo";
import { InitializeTheme } from "../themes";
import { ThemedDocs } from "../themes/ThemedDocs";
import { JavascriptProvider } from "./utils/JavascriptProvider";

const SearchDialog = dynamic(() => import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog), {
    ssr: true,
});

export function DocsPage(pageProps: DocsProps): ReactElement | null {
    useConsoleMessage();
    useMessageHandler();
    useBeforePopState();
    useHydrateAtoms([[DOCS_ATOM, pageProps]], { dangerouslyForceHydrate: true });

    return (
        <>
            <NextSeo />
            <InitializeTheme />
            <SearchDialog />
            <BgImageGradient />
            <ThemedDocs theme={pageProps.theme} />
            <PlaygroundContextProvider />
            <JavascriptProvider />
        </>
    );
}
