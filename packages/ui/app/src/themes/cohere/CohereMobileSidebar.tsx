import { ReactElement, memo } from "react";
import { useIsMobileSidebarOpen } from "../../atoms/sidebar";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { DesktopSidebar } from "../../sidebar/DesktopSidebar";

export const CohereMobileSidebar = memo(function CohereMobileSidebar(): ReactElement {
    const { layout } = useDocsContext();
    const isOpen = useIsMobileSidebarOpen();
    const showSearchBarInSidebar = layout?.disableHeader || layout?.searchbarPlacement !== "HEADER";

    // const setOpen = useSetAtom(MOBILE_SIDEBAR_OPEN_ATOM);
    // console.log("isOpen", isOpen);

    return (
        <DesktopSidebar
            className="fern-sidebar-container"
            showSearchBar={showSearchBarInSidebar}
            data-state={isOpen ? "open" : "closed"}
        />
    );
});
