"use client";

import { FernLink } from "@/components/link";
import { useAtomValue } from "jotai/react";
import { ComponentPropsWithoutRef } from "react";
import { activeTabAtom } from "../[[...slug]]/active-tab-index";

export default function TabItem(
  props: ComponentPropsWithoutRef<typeof FernLink> & {
    index: number;
  }
) {
  const activeTabIndex = useAtomValue(activeTabAtom);
  return (
    <FernLink
      {...props}
      data-state={props.index === activeTabIndex ? "active" : "inactive"}
    />
  );
}
