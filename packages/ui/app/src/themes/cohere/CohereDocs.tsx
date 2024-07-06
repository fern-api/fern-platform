import { FernScrollArea } from "@fern-ui/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { Router } from "next/router";
import { ReactElement, memo, useEffect, useImperativeHandle, useRef, useState } from "react";
import { CONTENT_HEIGHT_ATOM, SHOW_HEADER_ATOM } from "../../atoms/layout";
import { LOGO_TEXT_ATOM } from "../../atoms/logo";
import { SIDEBAR_DISABLED_ATOM, SIDEBAR_DISMISSABLE_ATOM } from "../../atoms/sidebar";
import { SCROLL_BODY_ATOM } from "../../atoms/viewport";
import { DocsMainContent } from "../../docs/DocsMainContent";
import { Sidebar } from "../../sidebar/Sidebar";
import { HeaderContainer } from "./HeaderContainer";

const CohereDocsStyle = () => {
    const contentHeight = useAtomValue(CONTENT_HEIGHT_ATOM);
    return (
        // eslint-disable-next-line react/no-unknown-property
        <style jsx global>
            {`
                :root {
                    ${contentHeight > 0 ? `--content-height: ${contentHeight}px;` : ""}
                    --header-offset: 0px;
                    --card-border: #d8cfc1;
                    --bg-search-dialog: #fafafa;
                }
            `}
        </style>
    );
};

function UnmemoizedCohereDocs(): ReactElement {
    const showHeader = useAtomValue(SHOW_HEADER_ATOM);

    const isSidebarDisabled = useAtomValue(SIDEBAR_DISABLED_ATOM);
    const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

    useHydrateAtoms([[LOGO_TEXT_ATOM, "docs"]], {
        dangerouslyForceHydrate: true,
    });

    const mainRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(useSetAtom(SCROLL_BODY_ATOM), () => mainRef.current ?? undefined);
    const setContentHeight = useSetAtom(CONTENT_HEIGHT_ATOM);

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
        <div id="fern-docs" className="fern-container fern-theme-cohere">
            <CohereDocsStyle />
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
