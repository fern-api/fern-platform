"use client";

import { Menu, X } from "lucide-react";

import { FernButton } from "@fern-docs/components";

import {
  useIsDismissableSidebarOpen,
  useToggleDismissableSidebar,
} from "@/state/mobile";

export function MobileMenuButton() {
  const isDismissableSidebarOpen = useIsDismissableSidebarOpen();
  const toggleDismissableSidebar = useToggleDismissableSidebar();
  return (
    <FernButton
      className="lg:hidden"
      onClick={toggleDismissableSidebar}
      icon={isDismissableSidebarOpen ? <X /> : <Menu />}
      intent={isDismissableSidebarOpen ? "primary" : "none"}
      variant={isDismissableSidebarOpen ? "filled" : "minimal"}
      rounded={true}
      size="large"
    />
  );
}
