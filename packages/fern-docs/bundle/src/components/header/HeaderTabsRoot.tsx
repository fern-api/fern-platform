"use client";

import * as Tabs from "@radix-ui/react-tabs";

import { useCurrentTab } from "@/state/navigation";

export function HeaderTabsRoot({ children }: { children: React.ReactNode }) {
  const currentTab = useCurrentTab();
  return (
    <Tabs.Root
      value={currentTab?.id}
      className="w-page-width-padded px-page-padding mx-auto hidden max-w-full select-none lg:block"
    >
      {children}
    </Tabs.Root>
  );
}
