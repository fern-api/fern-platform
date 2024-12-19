import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useAtomValue } from "jotai";
import { FERN_STREAM_ATOM } from "../../atoms";
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
}: SidebarEndpointPairNodeProps): React.ReactElement | null {
  const isStream = useAtomValue(FERN_STREAM_ATOM);

  return isStream ? (
    <SidebarApiLeafNode node={node.stream} depth={depth} shallow={shallow} />
  ) : (
    <SidebarApiLeafNode node={node.nonStream} depth={depth} shallow={shallow} />
  );
}
