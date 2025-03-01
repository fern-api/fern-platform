"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";

import { useSetAtom } from "jotai";

import { cn } from "@fern-docs/components";
import { FernScrollArea } from "@fern-docs/components";

import { SCROLL_BODY_ATOM } from "@/state/viewport";

import { HeaderContainer } from "./header-container";

const CohereDocsStyle = () => {
  return (
    <style jsx global>
      {`
        :root {
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

export default function CohereDocs({
  header,
  sidebar,
  children,
  announcement,
  tabs,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  tabs?: React.ReactNode;
}) {
  const showDismissableSidebar = false;

  const mainRef = useRef<HTMLDivElement>(null);

  const setScrollBody = useSetAtom(SCROLL_BODY_ATOM);
  useEffect(() => {
    setScrollBody(mainRef.current);
  }, [setScrollBody]);

  const pathname = usePathname();
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div id="fern-docs" className="fern-container fern-theme-cohere">
      <CohereDocsStyle />
      {announcement}
      <HeaderContainer header={header} tabs={tabs} />
      <div className="fern-body">
        {sidebar}
        <FernScrollArea
          rootClassName="fern-main"
          className={cn({
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
}
