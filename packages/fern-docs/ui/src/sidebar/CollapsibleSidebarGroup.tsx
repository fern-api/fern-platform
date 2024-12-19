import type { FernNavigation } from "@fern-api/fdr-sdk";
import * as Collapsible from "@radix-ui/react-collapsible";
import type { ReactElement } from "react";

interface FernSidebarGroupProps<T> {
  nodes: T[];
  open: boolean;
  renderNode: (node: T) => ReactElement;
  children: ReactElement;
}

export function CollapsibleSidebarGroup<
  T extends FernNavigation.NavigationNode,
>({
  nodes,
  open,
  renderNode,
  children,
}: FernSidebarGroupProps<T>): ReactElement | null {
  return (
    <Collapsible.Root open={open}>
      <Collapsible.Trigger asChild>{children}</Collapsible.Trigger>
      <Collapsible.Content asChild>
        <ul className="fern-sidebar-group">
          {nodes.map((node) => (
            <li key={node.id}>{renderNode(node)}</li>
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
