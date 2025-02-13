import { ReactNode } from "react";

import { useAtomValue } from "jotai";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { FERN_STREAM_ATOM } from "@/components/atoms";

import { SidebarApiLeafNode } from "./SidebarApiLeafNode";

interface SidebarEndpointPairNodeProps {
  node: FernNavigation.EndpointPairNode;
  depth: number;
  shallow: boolean;
}

export function SidebarEndpointPairNode({
  node,
  depth,
  shallow,
}: SidebarEndpointPairNodeProps): ReactNode {
  const isStream = useAtomValue(FERN_STREAM_ATOM);

  return isStream ? (
    <SidebarApiLeafNode node={node.stream} depth={depth} shallow={shallow} />
  ) : (
    <SidebarApiLeafNode node={node.nonStream} depth={depth} shallow={shallow} />
  );
}
