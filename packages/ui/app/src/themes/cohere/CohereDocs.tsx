import { FernScrollArea } from "@fern-ui/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import clsx from "clsx";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { Router } from "next/router";
import { CSSProperties, ReactElement, memo, useEffect, useRef, useState } from "react";
import { CONTENT_HEIGHT_ATOM, SHOW_HEADER_ATOM } from "../../atoms/layout";
import { LOGO_TEXT_ATOM } from "../../atoms/logo";
import { PORTAL_CONTAINER } from "../../atoms/portal";
import { SIDEBAR_DISABLED_ATOM, SIDEBAR_DISMISSABLE_ATOM } from "../../atoms/sidebar";
import { DocsMainContent } from "../../docs/DocsMainContent";
import { Sidebar } from "../../sidebar/Sidebar";
import { HeaderContainer } from "./HeaderContainer";

function UnmemoizedCohereDocs(): ReactElement {
    const showHeader = useAtomValue(SHOW_HEADER_ATOM);
    const setPortalContainer = useSetAtom(PORTAL_CONTAINER);

    const isSidebarDisabled = useAtomValue(SIDEBAR_DISABLED_ATOM);
    const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

    useHydrateAtoms([[LOGO_TEXT_ATOM, "docs"]], {
        dangerouslyForceHydrate: true,
    });

    const mainRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useAtom(CONTENT_HEIGHT_ATOM);

    // the maxWidth: contentWidth guards against Radix's ScrollArea, which relies on display: table
    // where the contents of the table are not constrained by the width of the table itself.
    // TODO: this is bad for performance, so we'll need to fix this behavior using CSS.
    const [contentWidth, setContentWidth] = useState<number>();
    useResizeObserver(mainRef, ([entry]) => {
        setContentHeight(entry.contentRect.height);
        setContentWidth(entry.contentRect.width);
    });

    useEffect(() => {
        const handleRouteChange = (_route: string, { shallow }: { shallow: boolean }) => {
            if (!shallow) {
                mainRef.current?.scrollTo(0, 0);
            }
        };
        Router.events.on("routeChangeComplete", handleRouteChange);
        return () => Router.events.off("routeChangeComplete", handleRouteChange);
    }, []);

    return (
        <div
            id="fern-docs"
            ref={setPortalContainer}
            className="fern-container fern-theme-cohere"
            style={
                {
                    "--content-height": `${contentHeight}px`,
                    "--header-offset": "0px",
                    "--card-border": "#D8CFC1",
                    "--bg-search-dialog": "#FAFAFA",
                } as CSSProperties
            }
        >
            {showHeader && <HeaderContainer />}
            <div className="fern-body">
                <Sidebar />
                <FernScrollArea
                    rootClassName="fern-main"
                    className={clsx({
                        "fern-sidebar-hidden": isSidebarDisabled || showDismissableSidebar,
                    })}
                    ref={mainRef}
                    scrollbars="vertical"
                >
                    <div style={{ maxWidth: contentWidth != null ? `${contentWidth}px` : undefined }}>
                        <DocsMainContent />

                        {/* Enables footer DOM injection */}
                        <footer id="fern-footer" />
                    </div>
                </FernScrollArea>
            </div>
        </div>
    );
}

export const CohereDocs = memo(UnmemoizedCohereDocs);
