import { FernButton } from "@fern-docs/components";
import { Menu, X } from "lucide-react";
import { ReactElement } from "react";
import {
  useCloseMobileSidebar,
  useIsMobileSidebarOpen,
  useOpenMobileSidebar,
} from "../atoms";

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
      icon={isMobileSidebarOpen ? <X /> : <Menu className="!size-icon-md" />}
      intent={isMobileSidebarOpen ? "primary" : "none"}
      variant={isMobileSidebarOpen ? "filled" : "minimal"}
      rounded={true}
      size="large"
    />
  );
}
