"use client";

import { Menu, Search, X } from "lucide-react";

import { Button, FernButton, cn } from "@fern-docs/components";

import {
  useIsDismissableSidebarOpen,
  useToggleDismissableSidebar,
} from "@/state/mobile";
import { useToggleSearchDialog } from "@/state/search";

export function MobileMenuButton() {
  const isDismissableSidebarOpen = useIsDismissableSidebarOpen();
  const toggleDismissableSidebar = useToggleDismissableSidebar();
  return (
    <Button
      className="shrink-0 rounded-full lg:hidden"
      onClick={toggleDismissableSidebar}
      variant={isDismissableSidebarOpen ? "default" : "ghost"}
      size="icon"
    >
      {isDismissableSidebarOpen ? <X /> : <Menu />}
    </Button>
  );
}
