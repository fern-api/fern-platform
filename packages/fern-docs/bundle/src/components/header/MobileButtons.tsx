"use client";

import { Menu, X } from "lucide-react";

import { Button, cn } from "@fern-docs/components";

import {
  useIsDismissableSidebarOpen,
  useToggleDismissableSidebar,
} from "@/state/mobile";

export function MobileMenuButton({ className }: { className?: string }) {
  const [isDismissableSidebarOpen] = useIsDismissableSidebarOpen();
  const toggleDismissableSidebar = useToggleDismissableSidebar();
  return (
    <Button
      className={cn("shrink-0 lg:hidden", className)}
      onClick={toggleDismissableSidebar}
      variant={isDismissableSidebarOpen ? "default" : "ghost"}
      size="icon"
    >
      {isDismissableSidebarOpen ? <X /> : <Menu />}
    </Button>
  );
}
