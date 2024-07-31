import { useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { DOCS_ATOM, FERN_QUERY_PARAMS, useMessageHandler, type DocsProps } from "../atoms";
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
    const router = useRouter();
    const [_, setQueryParams] = useAtom(FERN_QUERY_PARAMS);
    const { baseUrl } = pageProps;
    useConsoleMessage();
    useMessageHandler();
    useHydrateAtoms([[DOCS_ATOM, pageProps]], { dangerouslyForceHydrate: true });

    useEffect(() => {
        const queryGroupId = router.query.groupId as string | undefined;
        const queryValue = router.query.value as string | undefined;
        if (queryGroupId && queryValue) {
            setQueryParams({ [router.query.groupId as string]: router.query.value });
        }
    }, [router, setQueryParams]);

    return (
        <>
            <NextSeo />
            <InitializeTheme />
            <SearchDialog />
            <BgImageGradient />
            <NavigationContextProvider basePath={baseUrl.basePath}>
                <ThemedDocs theme={pageProps.theme} />
            </NavigationContextProvider>
            <PlaygroundContextProvider />
            <JavascriptProvider />
        </>
    );
}
