import clsx from "clsx";
import { useAtomValue } from "jotai";
import { ReactElement, memo } from "react";
import {
  CONTENT_HEIGHT_ATOM,
  DOCS_LAYOUT_ATOM,
  HEADER_OFFSET_ATOM,
  MOBILE_HEADER_OFFSET_ATOM,
  SHOW_HEADER_ATOM,
  SIDEBAR_DISMISSABLE_ATOM,
  useColors,
  useTheme,
} from "../../atoms";
import { DocsMainContent } from "../../docs/DocsMainContent";
import { DocsContent } from "../../resolver/DocsContent";
import { Sidebar } from "../../sidebar/Sidebar";
import { HeaderContainer } from "./HeaderContainer";

const DefaultDocsStyle = () => {
  const contentHeight = useAtomValue(CONTENT_HEIGHT_ATOM);
  const headerOffset = useAtomValue(HEADER_OFFSET_ATOM);
  const mobileHeaderOffset = useAtomValue(MOBILE_HEADER_OFFSET_ATOM);
  return (
    // eslint-disable-next-line react/no-unknown-property
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

function UnmemoizedDefaultDocs({
  content,
}: {
  content: DocsContent;
}): ReactElement {
  const colors = useColors();
  const layout = useAtomValue(DOCS_LAYOUT_ATOM);
  const showHeader = useAtomValue(SHOW_HEADER_ATOM);
  const theme = useTheme();
  const isSidebarFixed =
    layout?.disableHeader || colors[theme]?.sidebarBackground != null;

  const isSidebarDismissable = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

  return (
    <div id="fern-docs" className="fern-container fern-theme-default">
      <DefaultDocsStyle />
      {showHeader && <HeaderContainer />}

      <style>
        {`
                        .fern-sidebar-container {
                            border-right-width: ${colors.light?.sidebarBackground == null ? 0 : 1}px;
                            border-left-width: ${colors.light?.sidebarBackground == null || layout?.pageWidth?.type !== "full" ? 0 : 1}px;
                        }

                        :is(.dark) .fern-sidebar-container {
                            border-right-width: ${colors.dark?.sidebarBackground == null ? 0 : 1}px;
                            border-left-width: ${colors.dark?.sidebarBackground == null || layout?.pageWidth?.type !== "full" ? 0 : 1}px;
                        }
                    `}
      </style>

      <div className="fern-body">
        <Sidebar
          className={isSidebarFixed ? "fern-sidebar-fixed" : undefined}
        />
        <div
          className={clsx("fern-main", {
            "fern-sidebar-disabled": isSidebarDismissable,
          })}
        >
          <DocsMainContent content={content} />
        </div>
      </div>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </div>
  );
}

export const DefaultDocs = memo(UnmemoizedDefaultDocs);
