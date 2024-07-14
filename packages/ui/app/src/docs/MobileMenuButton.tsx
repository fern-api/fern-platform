import { FernButton } from "@fern-ui/components";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { ReactElement } from "react";
import { useCloseMobileSidebar, useIsMobileSidebarOpen, useOpenMobileSidebar } from "../atoms";

export function MobileMenuButton(): ReactElement {
    const isMobileSidebarOpen = useIsMobileSidebarOpen();
    const closeMobileSidebar = useCloseMobileSidebar();
    const openMobileSidebar = useOpenMobileSidebar();
    return (
        <FernButton
            onClickCapture={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (isMobileSidebarOpen) {
                    closeMobileSidebar();
                } else {
                    openMobileSidebar();
                }
            }}
            icon={isMobileSidebarOpen ? <Cross1Icon className="!size-5" /> : <HamburgerMenuIcon className="!size-5" />}
            intent={isMobileSidebarOpen ? "primary" : "none"}
            variant={isMobileSidebarOpen ? "filled" : "minimal"}
            rounded={true}
            size="large"
        />
    );
}
