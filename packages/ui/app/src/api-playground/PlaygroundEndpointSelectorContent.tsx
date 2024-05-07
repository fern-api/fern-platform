import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode } from "@fern-ui/fdr-utils";
import { Cross1Icon, MagnifyingGlassIcon, SlashIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { noop } from "lodash-es";
import dynamic from "next/dynamic";
import { Fragment, ReactElement, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { HttpMethodTag, withStream } from "../commons/HttpMethodTag";
import { Chip } from "../components/Chip";
import { FernButton } from "../components/FernButton";
import { FernInput } from "../components/FernInput";
import { FernScrollArea } from "../components/FernScrollArea";
import { FernTooltip } from "../components/FernTooltip";
import { usePlaygroundContext } from "./PlaygroundContext";

const Markdown = dynamic(() => import("../mdx/Markdown").then(({ Markdown }) => Markdown), { ssr: true });

export interface PlaygroundEndpointSelectorContentProps {
    apiGroups: ApiGroup[];
    closeDropdown?: () => void;
    selectedEndpoint?: SidebarNode.ApiPage;
    className?: string;
}

export interface ApiGroup {
    api: FdrAPI.ApiId;
    id: string;
    breadcrumbs: readonly string[];
    items: SidebarNode.ApiPage[];
}

function isApiGroupNotEmpty(group: ApiGroup): boolean {
    return group.items.filter((item) => item.type === "page").length > 0;
}

export function flattenApiSection(navigation: SidebarNode[]): ApiGroup[] {
    const result: ApiGroup[] = [];
    for (const node of navigation) {
        visitDiscriminatedUnion(node, "type")._visit({
            section: (section) => {
                result.push(
                    ...flattenApiSection(section.items).map((group) => ({
                        ...group,
                        breadcrumbs: [section.title, ...group.breadcrumbs],
                    })),
                );
            },
            apiSection: (apiSection) => {
                result.push({
                    api: apiSection.api,
                    id: apiSection.id,
                    breadcrumbs: [apiSection.title],
                    items: apiSection.items.filter((item): item is SidebarNode.ApiPage => item.type === "page"),
                });

                result.push(
                    ...flattenApiSection(
                        apiSection.items.filter(
                            (item): item is SidebarNode.SubpackageSection => item.type === "apiSection",
                        ),
                    ).map((group) => ({
                        ...group,
                        breadcrumbs: [apiSection.title, ...group.breadcrumbs],
                    })),
                );
            },
            pageGroup: noop,
            _other: noop,
        });
    }
    return result.filter(isApiGroupNotEmpty);
}

function matchesEndpoint(query: string, group: ApiGroup, endpoint: SidebarNode.ApiPage): boolean {
    return (
        group.breadcrumbs.some((breadcrumb) => breadcrumb.toLowerCase().includes(query.toLowerCase())) ||
        endpoint.title?.toLowerCase().includes(query.toLowerCase()) ||
        (endpoint.apiType === "endpoint" && endpoint.method.toLowerCase().includes(query.toLowerCase()))
    );
}

export const PlaygroundEndpointSelectorContent = forwardRef<HTMLDivElement, PlaygroundEndpointSelectorContentProps>(
    function PlaygroundEndpointSelectorContent({ apiGroups, closeDropdown, selectedEndpoint, className }, ref) {
        const { setSelectionStateAndOpen } = usePlaygroundContext();

        const [filterValue, setFilterValue] = useState<string>("");

        const selectedItemRef = useRef<HTMLLIElement>(null);

        const createSelectEndpoint = (group: ApiGroup, endpoint: SidebarNode.EndpointPage) => () => {
            setSelectionStateAndOpen({
                type: "endpoint",
                api: group.api,
                endpointId: endpoint.slug.join("/"),
            });
            closeDropdown?.();
        };

        const createSelectWebSocket = (group: ApiGroup, websocket: SidebarNode.ApiPage) => () => {
            setSelectionStateAndOpen({
                type: "websocket",
                api: group.api,
                webSocketId: websocket.slug.join("/"),
            });
            closeDropdown?.();
        };

        function renderApiDefinitionPackage(apiGroup: ApiGroup) {
            const endpoints = apiGroup.items.filter((endpoint): endpoint is SidebarNode.ApiPage =>
                matchesEndpoint(filterValue, apiGroup, endpoint),
            );
            if (endpoints.length === 0) {
                return null;
            }
            return (
                <li key={apiGroup.id} className="gap-2">
                    {apiGroup.breadcrumbs.length > 0 && (
                        <div className="bg-background-translucent sticky top-0 z-10 flex h-[30px] items-center px-3 py-1">
                            {apiGroup.breadcrumbs.map((breadcrumb, idx) => (
                                <Fragment key={idx}>
                                    {idx > 0 && <SlashIcon className="mx-0.5 size-3 text-faded" />}
                                    <span className="t-accent shrink truncate whitespace-nowrap text-xs">
                                        {breadcrumb}
                                    </span>
                                </Fragment>
                            ))}
                        </div>
                    )}
                    <ul className="relative z-0 list-none">
                        {endpoints.map((endpointItem) => {
                            const active = endpointItem.slug.join("/") === selectedEndpoint?.slug.join("/");
                            const text = renderTextWithHighlight(endpointItem.title, filterValue);
                            if (endpointItem.apiType === "endpoint") {
                                return (
                                    <li ref={active ? selectedItemRef : undefined} key={endpointItem.id}>
                                        <FernTooltip
                                            content={
                                                endpointItem.description != null ? (
                                                    <Markdown className="text-xs" mdx={endpointItem.description} />
                                                ) : undefined
                                            }
                                            side="right"
                                        >
                                            <FernButton
                                                text={
                                                    endpointItem.apiType === "endpoint" && endpointItem.stream
                                                        ? withStream(text)
                                                        : text
                                                }
                                                className="w-full rounded-none text-left"
                                                variant="minimal"
                                                intent={active ? "primary" : "none"}
                                                active={active}
                                                onClick={createSelectEndpoint(apiGroup, endpointItem)}
                                                rightIcon={<HttpMethodTag method={endpointItem.method} size="sm" />}
                                            />
                                        </FernTooltip>
                                    </li>
                                );
                            } else if (endpointItem.apiType === "websocket") {
                                return (
                                    <li ref={active ? selectedItemRef : undefined} key={endpointItem.id}>
                                        <FernTooltip
                                            content={
                                                endpointItem.description != null ? (
                                                    <Markdown className="text-xs" mdx={endpointItem.description} />
                                                ) : undefined
                                            }
                                            side="right"
                                        >
                                            <FernButton
                                                text={text}
                                                className="w-full rounded-none text-left"
                                                variant="minimal"
                                                intent={active ? "primary" : "none"}
                                                active={active}
                                                onClick={createSelectWebSocket(apiGroup, endpointItem)}
                                                rightIcon={<Chip name="WSS" small />}
                                            />
                                        </FernTooltip>
                                    </li>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </ul>
                </li>
            );
        }

        const renderedListItems = apiGroups.map((group) => renderApiDefinitionPackage(group)).filter(isNonNullish);
        const menuRef = useRef<HTMLDivElement>(null);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        useImperativeHandle(ref, () => menuRef.current!);

        return (
            <div className={cn("min-w-[300px] overflow-hidden rounded-xl flex flex-col", className)} ref={menuRef}>
                <div
                    className={cn("relative z-20 px-1 pt-1", {
                        "pb-1": renderedListItems.length === 0,
                        "pb-0": renderedListItems.length > 0,
                    })}
                >
                    <FernInput
                        leftIcon={<MagnifyingGlassIcon />}
                        data-1p-ignore="true"
                        autoFocus={true}
                        value={filterValue}
                        onValueChange={setFilterValue}
                        rightElement={
                            filterValue.length > 0 && (
                                <FernButton
                                    icon={<Cross1Icon />}
                                    variant="minimal"
                                    onClick={() => setFilterValue("")}
                                />
                            )
                        }
                    />
                </div>
                <FernScrollArea rootClassName="min-h-0 flex-1 shrink">
                    <ul className="list-none">{renderedListItems}</ul>
                </FernScrollArea>
            </div>
        );
    },
);

function renderTextWithHighlight(text: string, highlight: string): ReactElement[] {
    highlight = highlight.trim();
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
