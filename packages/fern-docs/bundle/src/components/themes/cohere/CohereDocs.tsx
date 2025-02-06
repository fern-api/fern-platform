"use client";

import { FernScrollArea } from "@fern-docs/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { usePathname } from "next/navigation";
import React, { memo, useEffect, useRef } from "react";
import {
  ANNOUNCEMENT_HEIGHT_ATOM,
  CONTENT_HEIGHT_ATOM,
  SCROLL_BODY_ATOM,
  SHOW_HEADER_ATOM,
  SIDEBAR_DISMISSABLE_ATOM,
} from "../../atoms";
import { Announcement } from "../../header/Announcement";
import { Sidebar } from "../../sidebar/Sidebar";
import { HeaderContainer } from "./HeaderContainer";

const CohereDocsStyle = () => {
  const contentHeight = useAtomValue(CONTENT_HEIGHT_ATOM);
  return (
    <style jsx global>
      {`
        :root {
          ${contentHeight > 0 ? `--content-height: ${contentHeight}px;` : ""}
          --header-offset: 0px;
          --border-color-card: #d8cfc1;
          --bg-color-search-dialog: #fafafa;
          --bg-color-header-tab-inactive-hover: #f5f5f5;
          --border-color-header-tab-active: #d8cfc1;
          --bg-color-header-tab-active: #e8e6de;
        }

        .dark {
          --bg-color-card: #0f0f0f;
          --border-color-card: #4d4d4d;
          --bg-color-search-dialog: #1e1e1e;
          --bg-color-header-tab-inactive-hover: #292929;
          --border-color-header-tab-active: #4d4d4d;
          --bg-color-header-tab-active: #2a2a2a;
        }
      `}
    </style>
  );
};

function UnmemoizedCohereDocs({ children }: { children: React.ReactNode }) {
  const showHeader = useAtomValue(SHOW_HEADER_ATOM);
  const announcementHeight = useAtomValue(ANNOUNCEMENT_HEIGHT_ATOM);

  const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

  const mainRef = useRef<HTMLDivElement>(null);

  const setScrollBody = useSetAtom(SCROLL_BODY_ATOM);
  useEffect(() => {
    setScrollBody(mainRef.current);
  }, [setScrollBody]);

  const setContentHeight = useSetAtom(CONTENT_HEIGHT_ATOM);
  useResizeObserver(mainRef, ([entry]) => {
    if (entry != null) {
      setContentHeight(entry.contentRect.height);
    }
  });

  const pathname = usePathname();
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const fernDocs = (
    <div
      id="fern-docs"
      className="fern-container fern-theme-cohere"
      style={{ top: announcementHeight }}
    >
      <CohereDocsStyle />
      {showHeader && <HeaderContainer />}
      <div className="fern-body">
        <Sidebar />
        <FernScrollArea
          rootClassName="fern-main"
          className={clsx({
            "fern-sidebar-hidden": showDismissableSidebar,
          })}
          ref={mainRef}
          scrollbars="vertical"
        >
          {children}

          {/* Enables footer DOM injection */}
          <footer id="fern-footer" />
        </FernScrollArea>
      </div>
    </div>
  );

  return (
    <>
      <CohereDocsStyle />
      <Announcement className="fixed inset-x-0 top-0" />
      {fernDocs}
    </>
  );
}

export const CohereDocs = memo(UnmemoizedCohereDocs);
