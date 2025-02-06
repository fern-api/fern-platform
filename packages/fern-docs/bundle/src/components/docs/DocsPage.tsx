"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ReactElement, useEffect } from "react";
import { useEdgeFlag, useMessageHandler, useSetJustNavigated } from "../atoms";
import { BgImageGradient } from "../components/BgImageGradient";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { JavascriptProvider } from "../components/JavascriptProvider";
import { LinkPreloadApiRoute } from "../components/LinkPreload";
import { useConsoleMessage } from "../hooks/useConsoleMessage";
import { PlaygroundContextProvider } from "../playground/PlaygroundContext";
import { InitializeTheme } from "../themes";
import { FernTheme, ThemedDocs } from "../themes/ThemedDocs";
import { scrollToRoute } from "../util/anchor";

const SearchDialog = dynamic(
  () =>
    import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog),
  {
    ssr: true,
  }
);

let timer: number;

export function DocsPage({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: FernTheme;
}): ReactElement | null {
  useConsoleMessage();
  useMessageHandler();

  const [setJustNavigated, destroy] = useSetJustNavigated();

  // this is a hack to scroll to the correct anchor position when the route changes (see workato's docs)
  // the underlying issue is that content rendering is delayed by an undetermined amount of time, so the anchor doesn't exist yet.
  // TODO: fix this properly.
  const pathname = usePathname();
  useEffect(() => {
    setJustNavigated();
    window.clearTimeout(timer);
    const scroll = () => scrollToRoute(pathname);
    if (!scroll()) {
      timer = window.setTimeout(scroll, 150);
    }
    return () => {
      destroy();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
      <InitializeTheme />
      <SearchDialog />
      <BgImageGradient />
      <ThemedDocs theme={theme}>
        <FernErrorBoundary>{children}</FernErrorBoundary>
      </ThemedDocs>
      <PlaygroundContextProvider />
      <JavascriptProvider />
    </>
  );
}
