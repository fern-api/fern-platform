import { FernLinkButton } from "@/components/components/FernLinkButton";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernTooltip } from "@fern-docs/components";
import { HttpMethodBadge } from "@fern-docs/components/badges";
import clsx from "clsx";
import { atom, useAtomValue } from "jotai";
import { ReactElement, forwardRef } from "react";
import { useMemoOne } from "use-memo-one";
import { getApiDefinitionAtom } from "../../atoms";
import { Markdown } from "../../mdx/Markdown";
import { conformExplorerRoute } from "../utils/explorer-route";

interface PlaygroundEndpointSelectorLeafNodeProps {
  node: FernNavigation.EndpointNode | FernNavigation.WebSocketNode;
  filterValue: string;
  active: boolean;
  shallow?: boolean;
  rootslug: FernNavigation.Slug;
}

export const PlaygroundEndpointSelectorLeafNode = forwardRef<
  HTMLLIElement,
  PlaygroundEndpointSelectorLeafNodeProps
>(({ node, filterValue, active, shallow, rootslug }, ref) => {
  const text = renderTextWithHighlight(node.title, filterValue);

  const description = useAtomValue(
    useMemoOne(
      () =>
        atom((get) => {
          const definition = get(getApiDefinitionAtom(node.apiDefinitionId));
          if (definition == null) {
            return undefined;
          }
          if (node.type === "endpoint") {
            return definition.endpoints[node.endpointId]?.description;
          } else if (node.type === "webSocket") {
            return definition.websockets[node.webSocketId]?.description;
          }
          return undefined;
        }),
      [node]
    )
  );

  const tooltipContent =
    description != null ? <Markdown mdx={description} size="xs" /> : undefined;

  if (node.type === "endpoint") {
    return (
      <li ref={ref}>
        <FernTooltip content={tooltipContent} side="right">
          <FernLinkButton
            href={conformExplorerRoute(node.slug, rootslug)}
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
                className={clsx("mr-1", {
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
        <FernTooltip content={tooltipContent} side="right">
          <FernLinkButton
            href={conformExplorerRoute(node.slug, rootslug)}
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
): ReactElement[] {
  highlight = highlight.trim();
  if (highlight === "") {
    return [<span key={0}>{text}</span>];
  }
  // Split text on higlight term, include term itself into parts, ignore case
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return parts.map((part, idx) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <mark className="t-default bg-accent-highlight" key={idx}>
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}
