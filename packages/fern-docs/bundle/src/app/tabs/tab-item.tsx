"use client";

import { FernLink } from "@/components/link";
import { useAtomValue } from "jotai/react";
import { ComponentPropsWithoutRef } from "react";
import { activeTabAtom } from "./active-tab-index";

export default function TabItem({
  tabId,
  defaultActive,
  ...props
}: ComponentPropsWithoutRef<typeof FernLink> & {
  tabId: string;
  defaultActive?: boolean;
}) {
  const activeTabId = useAtomValue(activeTabAtom);
  let isActive = activeTabId === tabId;
  if (!activeTabId && defaultActive) {
    isActive = true;
  }

  return <FernLink {...props} data-state={isActive ? "active" : "inactive"} />;
}
