import dynamic from "next/dynamic";
import { ReactElement } from "react";
import {
  HydrateAtoms,
  useEdgeFlag,
  useMessageHandler,
  useSetJustNavigated,
  type DocsProps,
} from "../atoms";
import { BgImageGradientWithAtom } from "../components/BgImageGradient";
import { JavascriptProvider } from "../components/JavascriptProvider";
import { LinkPreloadApiRoute } from "../components/LinkPreload";
import { useBeforePopState } from "../hooks/useBeforePopState";
import { useConsoleMessage } from "../hooks/useConsoleMessage";
import {
  useRouteChangeComplete,
  useRouteChangeStart,
} from "../hooks/useRouteChanged";
import { PlaygroundContextProvider } from "../playground/PlaygroundContext";
import { NextSeo } from "../seo/NextSeo";
import { InitializeTheme } from "../themes";
import { ThemeScript } from "../themes/ThemeScript";
import { ThemedDocs } from "../themes/ThemedDocs";
import { DocsMainContent } from "./DocsMainContent";

const SearchDialog = dynamic(
  () =>
    import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog),
  {
    ssr: true,
  }
);

let timer: number;

export function DocsPage(pageProps: DocsProps): ReactElement | null {
  useConsoleMessage();
  useMessageHandler();
  useBeforePopState();

  const [setJustNavigated, destroy] = useSetJustNavigated();
  useRouteChangeStart(setJustNavigated, destroy);

  // this is a hack to scroll to the correct anchor position when the route changes (see workato's docs)
  // the underlying issue is that content rendering is delayed by an undetermined amount of time, so the anchor doesn't exist yet.
  // TODO: fix this properly.
  useRouteChangeComplete(
    async (route) => {
      window.clearTimeout(timer);
      const scrollToRoute = await import("../util/anchor").then(
        (mod) => mod.scrollToRoute
      );
      const scroll = () => scrollToRoute(route);
      if (!scroll()) {
        timer = window.setTimeout(scroll, 150);
      }
    },
    () => {
      window.clearTimeout(timer);
    }
  );

  const isSearchV2Enabled = useEdgeFlag("isSearchV2Enabled");
  const isApiPlaygroundEnabled = useEdgeFlag("isApiPlaygroundEnabled");

  return (
    <>
      <LinkPreloadApiRoute
        href={
          isSearchV2Enabled
            ? "/api/fern-docs/search/v2/key"
            : "/api/fern-docs/search/v1/key"
        }
      />
      {isApiPlaygroundEnabled && (
        <LinkPreloadApiRoute href="/api/fern-docs/auth/api-key-injection" />
      )}
      <NextSeo />
      <InitializeTheme />
      <SearchDialog />
      <BgImageGradientWithAtom />
      <ThemedDocs theme={pageProps.theme}>
        <DocsMainContent content={pageProps.content} />
      </ThemedDocs>

      <PlaygroundContextProvider />
      <JavascriptProvider />
    </>
  );
}

// local preview doesn't use getServerSideProps, so its _app file cannot hydrate the atoms
export function LocalPreviewDocsPage(
  pageProps: DocsProps
): ReactElement | null {
  return (
    <HydrateAtoms pageProps={pageProps}>
      <ThemeScript colors={pageProps.colors} />
      <DocsPage {...pageProps} />
    </HydrateAtoms>
  );
}
