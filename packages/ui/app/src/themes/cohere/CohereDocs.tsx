import { FernScrollArea } from "@fern-ui/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import { useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { CSSProperties, ReactElement, memo, useRef, useState } from "react";
import { CONTENT_HEIGHT_ATOM } from "../../atoms/layout";
import { LOGO_TEXT_ATOM } from "../../atoms/logo";
import { useLayoutBreakpoint } from "../../atoms/viewport";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { DocsMainContent } from "../../docs/DocsMainContent";
import { Sidebar } from "../../sidebar/Sidebar";
import { HeaderContainer } from "./HeaderContainer";

function UnmemoizedCohereDocs(): ReactElement {
    const { layout } = useDocsContext();
    const breakpoint = useLayoutBreakpoint();
    const showHeader = layout?.disableHeader !== true || breakpoint.max("lg");

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

    return (
        <div
            className="fern-container fern-theme-cohere"
            style={
                {
                    "--content-height": `${contentHeight}px`,
                    "--header-offset": "0px",
                    "--card-border": "#D8CFC1",
                } as CSSProperties
            }
        >
            {showHeader && <HeaderContainer />}
            <div className="fern-body">
                <Sidebar />
                <FernScrollArea className="fern-main" ref={mainRef} scrollbars="vertical">
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
