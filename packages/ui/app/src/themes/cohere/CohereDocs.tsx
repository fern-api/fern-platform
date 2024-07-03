import { FernScrollArea } from "@fern-ui/components";
import { useHydrateAtoms } from "jotai/utils";
import { ReactElement, memo } from "react";
import { LOGO_TEXT_ATOM } from "../../atoms/logo";
import { useSidebarNodes } from "../../atoms/navigation";
import { useLayoutBreakpoint } from "../../atoms/window";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { useNavigationContext } from "../../contexts/navigation-context";
import { DocsMainContent } from "../../docs/DocsMainContent";
import { BuiltWithFern } from "../../sidebar/BuiltWithFern";
import { CohereMobileSidebar } from "./CohereMobileSidebar";
import { HeaderContainer } from "./HeaderContainer";

// const DesktopSidebar = dynamic(
//     () => import("../../sidebar/DesktopSidebar").then(({ DesktopSidebar }) => DesktopSidebar),
//     {
//         ssr: true,
//     },
// );

function UnmemoizedCohereDocs(): ReactElement {
    const { layout } = useDocsContext();
    const sidebar = useSidebarNodes();
    const { resolvedPath } = useNavigationContext();
    const breakpoint = useLayoutBreakpoint();
    const showHeader = layout?.disableHeader !== true || breakpoint.max("lg");
    const showSidebar = sidebar != null && resolvedPath.type !== "changelog-entry";

    useHydrateAtoms([[LOGO_TEXT_ATOM, "docs"]]);

    return (
        <div className="fern-container fern-theme-cohere">
            {showHeader && <HeaderContainer />}

            <div className="fern-body">
                {/* {showSidebar && (
                    <DesktopSidebar showSearchBar={showSearchBarInSidebar} className="fern-sidebar-desktop" />
                )} */}
                <FernScrollArea className="fern-main">
                    <DocsMainContent />
                    <BuiltWithFern className="mx-auto my-8 w-fit" />
                </FernScrollArea>
                {showSidebar && <CohereMobileSidebar />}
            </div>

            {/* Enables footer DOM injection */}
            <footer id="fern-footer" />
        </div>
    );
}

export const CohereDocs = memo(UnmemoizedCohereDocs);
