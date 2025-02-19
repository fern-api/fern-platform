"use client";

import * as Tabs from "@radix-ui/react-tabs";

import { useCurrentTabId } from "@/state/navigation";

export function HeaderTabsRoot({ children }: { children: React.ReactNode }) {
  const currentTabId = useCurrentTabId();
  return (
    <Tabs.Root
      value={currentTabId}
      className="w-page-width-padded px-page-padding mx-auto hidden max-w-full select-none lg:block"
    >
      {children}
    </Tabs.Root>
  );
}
