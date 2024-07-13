import { useHydrateAtoms } from "jotai/utils";
import { Redirect } from "next";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { DOCS_ATOM, useMessageHandler, type DocsProps } from "../atoms";
import { NavigationContextProvider } from "../contexts/navigation-context/NavigationContextProvider";
import { BgImageGradient } from "../docs/BgImageGradient";
import { useConsoleMessage } from "../hooks/useConsoleMessage";
import { NextSeo } from "../seo/NextSeo";
import { InitializeTheme } from "../themes";
import { ThemedDocs } from "../themes/ThemedDocs";
import { JavascriptProvider } from "./utils/JavascriptProvider";

const SearchDialog = dynamic(() => import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog), {
    ssr: true,
});

export function DocsPage(pageProps: DocsProps): ReactElement | null {
    const { baseUrl } = pageProps;
    useConsoleMessage();
    useMessageHandler();
    useHydrateAtoms([[DOCS_ATOM, pageProps]], { dangerouslyForceHydrate: true });

    return (
        <>
            <NextSeo />
            <InitializeTheme />
            <SearchDialog />
            <BgImageGradient />
            <NavigationContextProvider basePath={baseUrl.basePath}>
                <PlaygroundContextProvider>
                    <ThemedDocs theme={pageProps.theme} />
                </PlaygroundContextProvider>
            </NavigationContextProvider>
            <JavascriptProvider />
        </>
    );
}

export type DocsPageResult<Props> =
    | { type: "props"; props: Props; revalidate?: number | boolean }
    | { type: "redirect"; redirect: Redirect; revalidate?: number | boolean }
    | { type: "notFound"; notFound: true; revalidate?: number | boolean };
