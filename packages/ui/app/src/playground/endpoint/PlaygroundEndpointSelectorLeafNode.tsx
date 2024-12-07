import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernTooltip } from "@fern-ui/components";
import { HttpMethodBadge } from "@fern-ui/components/badges";
import clsx from "clsx";
import { atom, useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { ReactElement, forwardRef } from "react";
import { useMemoOne } from "use-memo-one";
import { getApiDefinitionAtom, useSetAndOpenPlayground } from "../../atoms";
import { usePreloadApiLeaf } from "../hooks/usePreloadApiLeaf";

const Markdown = dynamic(() => import("../../mdx/Markdown").then(({ Markdown }) => Markdown));

interface PlaygroundEndpointSelectorLeafNodeProps {
    node: FernNavigation.EndpointNode | FernNavigation.WebSocketNode;
    filterValue: string;
    active: boolean;
    closeDropdown: (() => void) | undefined;
}

export const PlaygroundEndpointSelectorLeafNode = forwardRef<HTMLLIElement, PlaygroundEndpointSelectorLeafNodeProps>(
    ({ node, filterValue, active, closeDropdown }, ref) => {
        const preload = usePreloadApiLeaf();
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
                [node],
            ),
        );

        const setSelectionStateAndOpen = useSetAndOpenPlayground();

        const createSelectEndpoint = (endpoint: FernNavigation.NavigationNodeApiLeaf) => () => {
            void setSelectionStateAndOpen(endpoint);
            closeDropdown?.();
        };

        const tooltipContent = description != null ? <Markdown mdx={description} size="xs" /> : undefined;

        if (node.type === "endpoint") {
            return (
                <li ref={ref}>
                    <FernTooltip content={tooltipContent} side="right">
                        <FernButton
                            text={text}
                            className="w-full text-left"
                            variant="minimal"
                            intent={active ? "primary" : "none"}
                            active={active}
                            onClick={createSelectEndpoint(node)}
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
                            onMouseEnter={() => void preload(node)}
                        />
                    </FernTooltip>
                </li>
            );
        } else if (node.type === "webSocket") {
            return (
                <li ref={ref}>
                    <FernTooltip content={tooltipContent} side="right">
                        <FernButton
                            text={text}
                            className="w-full text-left"
                            variant="minimal"
                            intent={active ? "primary" : "none"}
                            active={active}
                            onClick={createSelectEndpoint(node)}
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
                            onMouseEnter={() => void preload(node)}
                        />
                    </FernTooltip>
                </li>
            );
        } else {
            return null;
        }
    },
);

PlaygroundEndpointSelectorLeafNode.displayName = "PlaygroundEndpointSelectorLeafNode";

function renderTextWithHighlight(text: string, highlight: string): ReactElement[] {
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
        ),
    );
}
