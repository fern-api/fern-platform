import type { FernNavigation } from "@fern-api/fdr-sdk";
import { cn } from "@fern-docs/components";
import { HttpMethodBadge } from "@fern-docs/components/badges";

import { useIsSelectedSidebarNode } from "@/state/navigation";

export function ApiLeafBadge({
  node,
  className,
}: {
  node: FernNavigation.NavigationNodeApiLeaf;
  className?: string;
}) {
  const selected = useIsSelectedSidebarNode(node.id);
  if (node.type === "webSocket") {
    return (
      <HttpMethodBadge
        method="GET"
        size="sm"
        variant={selected ? "solid" : "subtle"}
        className={className}
      >
        WSS
      </HttpMethodBadge>
    );
  } else {
    if (node.type === "endpoint" && node.isResponseStream) {
      return (
        <HttpMethodBadge
          method={node.method}
          size="sm"
          variant={selected ? "solid" : "subtle"}
          className={cn(className, {
            "tracking-tighter": node.isResponseStream,
          })}
        >
          STREAM
        </HttpMethodBadge>
      );
    }

    return (
      <HttpMethodBadge
        method={node.method}
        size="sm"
        variant={selected ? "solid" : "subtle"}
        className={className}
      />
    );
  }
}
