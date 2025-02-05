"use client";

import { foundNodeAtom } from "@/state/sidebar-atom";
import { useAtomValue } from "jotai";

export default function IfSidebar({
  children,
  equals,
  defaultTrue = false,
}: {
  equals: string;
  defaultTrue?: boolean;
  children: React.ReactNode;
}) {
  const sidebarRootNode = useAtomValue(foundNodeAtom)?.sidebar?.id;
  return (
    (sidebarRootNode === equals || (sidebarRootNode == null && defaultTrue)) &&
    children
  );
}
