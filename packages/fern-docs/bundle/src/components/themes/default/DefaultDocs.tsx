"use client";

import clsx from "clsx";
import { useAtomValue } from "jotai";

import {
  CONTENT_HEIGHT_ATOM,
  DOCS_LAYOUT_ATOM,
  HEADER_OFFSET_ATOM,
  MOBILE_HEADER_OFFSET_ATOM,
  SIDEBAR_DISMISSABLE_ATOM,
} from "@/components/atoms";
import { ColorsThemeConfig } from "@/server/types";

import { HeaderContainer } from "./HeaderContainer";

const DefaultDocsStyle = () => {
  const contentHeight = useAtomValue(CONTENT_HEIGHT_ATOM);
  const headerOffset = useAtomValue(HEADER_OFFSET_ATOM);
  const mobileHeaderOffset = useAtomValue(MOBILE_HEADER_OFFSET_ATOM);
  return (
    <style jsx global>
      {`
        :root {
          ${contentHeight > 0 ? `--content-height: ${contentHeight}px;` : ""}
          --header-offset: ${headerOffset}px;
        }

        @media (max-width: 1024px) {
          :root {
            --header-offset: ${mobileHeaderOffset}px;
          }
        }
      `}
    </style>
  );
};

export function DefaultDocs({
  header,
  sidebar,
  children,
  announcement,
  colors,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  colors: {
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  };
}) {
  const layout = useAtomValue(DOCS_LAYOUT_ATOM);

  const isSidebarDismissable = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

  return (
    <div id="fern-docs" className="fern-container fern-theme-default">
      <DefaultDocsStyle />
      <HeaderContainer
        header={header}
        announcement={announcement}
        showHeader
        showHeaderTabs
        colors={colors}
      />

      <style jsx>
        {`
          .fern-sidebar-container {
            border-right-width: ${colors.light?.sidebarBackground == null
              ? 0
              : 1}px;
            border-left-width: ${colors.light?.sidebarBackground == null ||
            layout?.pageWidth?.type !== "full"
              ? 0
              : 1}px;
          }

          :global(:is(.dark)) .fern-sidebar-container {
            border-right-width: ${colors.dark?.sidebarBackground == null
              ? 0
              : 1}px;
            border-left-width: ${colors.dark?.sidebarBackground == null ||
            layout?.pageWidth?.type !== "full"
              ? 0
              : 1}px;
          }
        `}
      </style>

      <div className="fern-body">
        {sidebar}
        <div
          className={clsx("fern-main", {
            "fern-sidebar-disabled": isSidebarDismissable,
          })}
        >
          {children}
        </div>
      </div>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </div>
  );
}

export default DefaultDocs;
