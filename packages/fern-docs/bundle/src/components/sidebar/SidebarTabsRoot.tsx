"use client";

import * as Tabs from "@radix-ui/react-tabs";

import { cn } from "@fern-docs/components";

import { useCurrentTab } from "@/state/navigation";

export function SidebarTabsRoot({
  children,
  mobileOnly,
}: {
  children: React.ReactNode;
  mobileOnly?: boolean;
}) {
  const currentTab = useCurrentTab();
  return (
    <Tabs.Root
      value={currentTab?.id}
      className={cn("my-6", {
        "lg:hidden": mobileOnly,
      })}
    >
      {children}
    </Tabs.Root>
  );
}
