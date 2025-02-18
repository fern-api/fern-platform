import { ReactElement, forwardRef } from "react";

import escapeStringRegexp from "escape-string-regexp";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";
import { FernTooltip } from "@fern-docs/components";
import { HttpMethodBadge } from "@fern-docs/components/badges";

import { FernLinkButton } from "@/components/components/FernLinkButton";

import { conformExplorerRoute } from "../utils/explorer-route";

interface PlaygroundEndpointSelectorLeafNodeProps {
  node: FernNavigation.EndpointNode | FernNavigation.WebSocketNode;
  filterValue: string;
  active: boolean;
  shallow?: boolean;
}

export const PlaygroundEndpointSelectorLeafNode = forwardRef<
  HTMLLIElement,
  PlaygroundEndpointSelectorLeafNodeProps
>(({ node, filterValue, active, shallow }, ref) => {
  const text = renderTextWithHighlight(node.title, filterValue);

  // const description = useAtomValue(
  //   useMemoOne(
  //     () =>
  //       atom((get) => {
  //         const definition = get(getApiDefinitionAtom(node.apiDefinitionId));
  //         if (definition == null) {
  //           return undefined;
  //         }
  //         if (node.type === "endpoint") {
  //           return definition.endpoints[node.endpointId]?.description;
  //         } else if (node.type === "webSocket") {
  //           return definition.websockets[node.webSocketId]?.description;
  //         }
  //         return undefined;
  //       }),
  //     [node]
  //   )
  // );

  // const tooltipContent =
  //   description != null ? <Markdown mdx={description} size="xs" /> : undefined;

  if (node.type === "endpoint") {
    return (
      <li ref={ref}>
        <FernTooltip content={null} side="right">
          <FernLinkButton
            href={conformExplorerRoute(node.slug)}
            shallow={shallow}
            text={text}
            className="w-full text-left"
            variant="minimal"
            intent={active ? "primary" : "none"}
            active={active}
            icon={
              <HttpMethodBadge
                method={node.method}
                size="sm"
                variant={active ? "solid" : "subtle"}
                className={cn("mr-1", {
                  "tracking-tighter": node.isResponseStream,
                })}
              >
                {node.isResponseStream ? "STREAM" : undefined}
              </HttpMethodBadge>
            }
          />
        </FernTooltip>
      </li>
    );
  } else if (node.type === "webSocket") {
    return (
      <li ref={ref}>
        <FernTooltip content={null} side="right">
          <FernLinkButton
            href={conformExplorerRoute(node.slug)}
            shallow={shallow}
            text={text}
            className="w-full text-left"
            variant="minimal"
            intent={active ? "primary" : "none"}
            active={active}
            icon={
              <HttpMethodBadge
                method="GET"
                size="sm"
                variant={active ? "solid" : "subtle"}
                className="mr-1"
              >
                WSS
              </HttpMethodBadge>
            }
          />
        </FernTooltip>
      </li>
    );
  } else {
    return null;
  }
});

PlaygroundEndpointSelectorLeafNode.displayName =
  "PlaygroundEndpointSelectorLeafNode";

function renderTextWithHighlight(
  text: string,
  highlight: string
): ReactElement<any>[] {
  highlight = highlight.trim();
  if (highlight === "") {
    return [<span key={0}>{text}</span>];
  }
  // Split text on higlight term, include term itself into parts, ignore case
  const parts = text.split(
    new RegExp(`(${escapeStringRegexp(highlight)})`, "gi")
  );
  return parts.map((part, idx) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <mark className="text-body bg-accent-highlight" key={idx}>
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}
