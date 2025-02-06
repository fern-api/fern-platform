"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ReactElement, useEffect } from "react";
import { useMessageHandler, useSetJustNavigated } from "../atoms";
import { BgImageGradient } from "../components/BgImageGradient";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { JavascriptProvider } from "../components/JavascriptProvider";
import { useConsoleMessage } from "../hooks/useConsoleMessage";
import { PlaygroundContextProvider } from "../playground/PlaygroundContext";
import { InitializeTheme } from "../themes";
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
}: {
  children: React.ReactNode;
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

  return (
    <>
      <InitializeTheme />
      <SearchDialog />
      <BgImageGradient />
      <FernErrorBoundary>{children}</FernErrorBoundary>
      <PlaygroundContextProvider />
      <JavascriptProvider />
    </>
  );
}
