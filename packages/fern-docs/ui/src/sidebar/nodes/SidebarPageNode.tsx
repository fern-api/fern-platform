import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useIsSelectedSidebarNode } from "../../atoms";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarPageNodeProps {
  node: FernNavigation.NavigationNodeWithMarkdown;
  depth: number;
  className?: string;
  linkClassName?: string;
  shallow?: boolean;
}

export function SidebarPageNode({
  node,
  depth,
  className,
  linkClassName,
  shallow,
}: SidebarPageNodeProps): React.ReactElement | null {
  const selected = useIsSelectedSidebarNode(node.id);

  if (node.hidden && !selected) {
    return null;
  }

  return (
    <SidebarSlugLink
      nodeId={node.id}
      className={className}
      linkClassName={linkClassName}
      slug={node.slug}
      depth={Math.max(depth - 1, 0)}
      title={node.title}
      selected={selected}
      icon={node.icon}
      hidden={node.hidden}
      authed={node.authed}
      shallow={shallow}
    />
  );
}
