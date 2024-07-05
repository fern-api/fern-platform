import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useTheme } from "next-themes";
import { CSSProperties, ReactElement, memo } from "react";
import { CONTENT_HEIGHT_ATOM, HEADER_OFFSET_ATOM } from "../../atoms/layout";
import { SIDEBAR_DISABLED_ATOM, SIDEBAR_DISMISSABLE_ATOM } from "../../atoms/sidebar";
import { useLayoutBreakpoint } from "../../atoms/viewport";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { DocsMainContent } from "../../docs/DocsMainContent";
import { Sidebar } from "../../sidebar/Sidebar";
import { HeaderContainer } from "./HeaderContainer";

function UnmemoizedDefaultDocs(): ReactElement {
    const { layout, colors } = useDocsContext();
    const breakpoint = useLayoutBreakpoint();
    const showHeader = layout?.disableHeader !== true || breakpoint.max("lg");
    const { resolvedTheme: theme = "light" } = useTheme();
    const isSidebarFixed = layout?.disableHeader || colors[theme as "light" | "dark"]?.sidebarBackground != null;

    const contentHeight = useAtomValue(CONTENT_HEIGHT_ATOM);
    const headerOffset = useAtomValue(HEADER_OFFSET_ATOM);
    const isSidebarDisabled = useAtomValue(SIDEBAR_DISABLED_ATOM);
    const isSidebarDismissable = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

    return (
        <div
            id="fern-docs"
            className="fern-container fern-theme-default"
            style={
                {
                    "--content-height": `${contentHeight}px`,
                    "--header-offset": showHeader ? `${headerOffset}px` : "0px",
                } as CSSProperties
            }
        >
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
                <Sidebar className={isSidebarFixed ? "fern-sidebar-fixed" : undefined} />
                <div
                    className={clsx("fern-main", {
                        "fern-sidebar-disabled": isSidebarDisabled || isSidebarDismissable,
                    })}
                >
                    <DocsMainContent />
                </div>
            </div>

            {/* Enables footer DOM injection */}
            <footer id="fern-footer" />
        </div>
    );
}

export const DefaultDocs = memo(UnmemoizedDefaultDocs);
