"use client";

import { Menu, Search, X } from "lucide-react";

import { FernButton, cn } from "@fern-docs/components";

import {
  useIsDismissableSidebarOpen,
  useToggleDismissableSidebar,
} from "@/state/mobile";
import { useToggleSearchDialog } from "@/state/search";

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

export function MobileSearchButton({ className }: { className?: string }) {
  const toggleSearchDialog = useToggleSearchDialog();
  return (
    <FernButton
      className={cn("lg:hidden", className)}
      icon={<Search />}
      intent="none"
      variant="minimal"
      rounded={true}
      size="large"
      onClick={toggleSearchDialog}
    />
  );
}
