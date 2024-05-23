import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode } from "@fern-ui/fdr-utils";
import { Cross1Icon, MagnifyingGlassIcon, SlashIcon } from "@radix-ui/react-icons";
import cn, { clsx } from "clsx";
import { compact, noop } from "lodash-es";
import dynamic from "next/dynamic";
import { Fragment, ReactElement, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { FernButton } from "../components/FernButton";
import { FernInput } from "../components/FernInput";
import { FernScrollArea } from "../components/FernScrollArea";
import { FernTooltip, FernTooltipProvider } from "../components/FernTooltip";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
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
                    breadcrumbs: apiSection.isSidebarFlattened ? [] : [apiSection.title],
                    items: apiSection.items
                        .filter((item): item is SidebarNode.ApiPage => item.type === "page")
                        .flatMap((item): SidebarNode.ApiPage[] =>
                            SidebarNode.isEndpointPage(item) ? compact([item, item.stream]) : [item],
                        ),
                });

                result.push(
                    ...flattenApiSection(
                        apiSection.items.filter(
                            (item): item is SidebarNode.SubpackageSection => item.type === "apiSection",
                        ),
                    ).map((group) => ({
                        ...group,
                        breadcrumbs: apiSection.isSidebarFlattened
                            ? group.breadcrumbs
                            : [apiSection.title, ...group.breadcrumbs],
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
    ({ apiGroups, closeDropdown, selectedEndpoint, className }, ref) => {
        const scrollRef = useRef<HTMLDivElement>(null);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        useImperativeHandle(ref, () => scrollRef.current!);

        const { setSelectionStateAndOpen } = usePlaygroundContext();

        const [filterValue, setFilterValue] = useState<string>("");

        const selectedItemRef = useRef<HTMLLIElement>(null);

        useEffect(() => {
            selectedItemRef.current?.scrollIntoView({ block: "center" });
        }, []);

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
                <li key={apiGroup.id}>
                    {apiGroup.breadcrumbs.length > 0 && (
                        <div className="flex h-[30px] items-center px-3 py-1 truncate">
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
                                                text={text}
                                                className="w-full text-left"
                                                variant="minimal"
                                                intent={active ? "primary" : "none"}
                                                active={active}
                                                onClick={createSelectEndpoint(apiGroup, endpointItem)}
                                                rightIcon={
                                                    <HttpMethodTag
                                                        method={endpointItem.method}
                                                        size="sm"
                                                        active={active}
                                                    />
                                                }
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
                                                rightIcon={<HttpMethodTag method="WSS" />}
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
        return (
            <FernTooltipProvider>
                <div className={clsx("flex flex-col size-full relative", className)} ref={scrollRef}>
                    <div className={cn("relative z-20 px-3 pt-3 pb-0")}>
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
                            placeholder="Search for endpoints..."
                        />
                    </div>
                    <FernScrollArea
                        rootClassName="min-h-0 flex-1 shrink w-full"
                        className="mask-grad-y-6 w-full !flex"
                        scrollbars="vertical"
                        asChild
                        ref={ref}
                    >
                        <ul className="list-none p-3 flex flex-col gap-2 w-full h-fit">{renderedListItems}</ul>
                        <div className="!h-6"></div>
                    </FernScrollArea>
                    <BuiltWithFern className="border-t border-default py-4 px-10 bg-background" />
                </div>
            </FernTooltipProvider>
        );
    },
);

PlaygroundEndpointSelectorContent.displayName = "PlaygroundEndpointSelectorContent";

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
