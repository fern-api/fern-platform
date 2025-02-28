"use client";

import { ReactNode } from "react";

import { ExternalLink } from "lucide-react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FaIcon } from "@fern-docs/components/fa-icon";

import { useLocationHref } from "../../hooks/useLocationHref";
import { SidebarLink } from "../SidebarLink";

interface SidebarLinkNodeProps {
  node: FernNavigation.LinkNode;
  depth: number;
  className?: string;
}

export function SidebarLinkNode({
  node,
  depth,
  className,
}: SidebarLinkNodeProps): ReactNode {
  const locationHref = useLocationHref();
  const selected =
    locationHref === String(new URL(node.url, locationHref).href);
  return (
    <SidebarLink
      icon={node.icon ? <FaIcon icon={node.icon} /> : undefined}
      nodeId={node.id}
      className={className}
      depth={Math.max(depth - 1, 0)}
      title={node.title}
      rightElement={<ExternalLink />}
      href={node.url}
      selected={selected}
    />
  );
}
