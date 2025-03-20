"use client";

import { Menu, X } from "lucide-react";

import { Button, cn } from "@fern-docs/components";

import { useIsDismissableSidebarOpen } from "@/state/mobile";

export function MobileMenuButton({ className }: { className?: string }) {
  const [open, setOpen] = useIsDismissableSidebarOpen();
  return (
    <Button
      className={cn("shrink-0 lg:hidden", className)}
      onClick={() => setOpen((prev) => !prev)}
      variant={open ? "default" : "ghost"}
      size="icon"
    >
      {open ? <X /> : <Menu />}
    </Button>
  );
}
