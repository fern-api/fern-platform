import { useHydrateAtoms } from "jotai/utils";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { DOCS_ATOM, useMessageHandler, useSetJustNavigated, type DocsProps } from "../atoms";
import { BgImageGradient } from "../components/BgImageGradient";
import { useBeforePopState } from "../hooks/useBeforePopState";
import { useConsoleMessage } from "../hooks/useConsoleMessage";
import { useRouteChangeComplete, useRouteChangeStart } from "../hooks/useRouteChanged";
import { NextSeo } from "../seo/NextSeo";
import { InitializeTheme } from "../themes";
import { ThemedDocs } from "../themes/ThemedDocs";
import { JavascriptProvider } from "./utils/JavascriptProvider";

const SearchDialog = dynamic(() => import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog), {
    ssr: true,
});

let timer: number;

export function DocsPage(pageProps: DocsProps): ReactElement | null {
    useConsoleMessage();
    useMessageHandler();
    useBeforePopState();
    useHydrateAtoms([[DOCS_ATOM, pageProps]], { dangerouslyForceHydrate: true });

    const [setJustNavigated, destroy] = useSetJustNavigated();
    useRouteChangeStart(setJustNavigated, destroy);

    // this is a hack to scroll to the correct anchor position when the route changes (see workato's docs)
    // the underlying issue is that content rendering is delayed by an undetermined amount of time, so the anchor doesn't exist yet.
    // TODO: fix this properly.
    useRouteChangeComplete(
        async (route) => {
            window.clearTimeout(timer);
            const scrollToRoute = await import("../util/anchor").then((mod) => mod.scrollToRoute);
            const scroll = () => scrollToRoute(route);
            if (!scroll()) {
                timer = window.setTimeout(scroll, 150);
            }
        },
        () => {
            window.clearTimeout(timer);
        },
    );

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
