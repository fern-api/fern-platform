import clsx from "clsx";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { ReactElement, memo } from "react";
import { useSidebarNodes } from "../../atoms/navigation";
import { useLayoutBreakpoint } from "../../atoms/window";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { useNavigationContext } from "../../contexts/navigation-context";
import { DocsMainContent } from "../../docs/DocsMainContent";
import { BuiltWithFern } from "../../sidebar/BuiltWithFern";
import { HeaderContainer } from "./HeaderContainer";

const Sidebar = dynamic(() => import("./Sidebar").then(({ Sidebar }) => Sidebar), { ssr: true });

function UnmemoizedDefaultDocs(): ReactElement {
    const { layout, colors } = useDocsContext();
    const sidebar = useSidebarNodes();
    const { resolvedTheme: theme = "light" } = useTheme();
    const { resolvedPath } = useNavigationContext();

    const breakpoint = useLayoutBreakpoint();
    const showHeader = layout?.disableHeader !== true || breakpoint.max("lg");
    const showSidebar = sidebar != null && resolvedPath.type !== "changelog-entry";
    const isSidebarFixed = layout?.disableHeader || colors[theme as "light" | "dark"]?.sidebarBackground != null;

    return (
        <div className={"fern-container"}>
            {showHeader && <HeaderContainer />}

            <div className="fern-body">
                {showSidebar && (
                    <>
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
                        <Sidebar
                            className={clsx("fern-sidebar-container", {
                                "fern-sidebar-fixed": isSidebarFixed,
                            })}
                            showSearchBar={layout?.disableHeader || layout?.searchbarPlacement !== "HEADER"}
                        />
                        {isSidebarFixed && <div className="hidden w-sidebar-width lg:block" />}
                    </>
                )}
                <main className="fern-main">
                    <DocsMainContent />
                    <BuiltWithFern className="absolute bottom-0 left-1/2 z-50 my-8 flex w-fit -translate-x-1/2 justify-center" />
                </main>
            </div>

            {/* Enables footer DOM injection */}
            <footer id="fern-footer" />
        </div>
    );
}

export const DefaultDocs = memo(UnmemoizedDefaultDocs);
