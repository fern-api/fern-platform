import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernInput, FernScrollArea, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { EMPTY_ARRAY, isNonNullish } from "@fern-platform/core-utils";
import cn, { clsx } from "clsx";
import { Search, Slash, Xmark } from "iconoir-react";
import dynamic from "next/dynamic";
import { Fragment, ReactElement, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useSetAndOpenPlayground } from "../../atoms";
import { HttpMethodTag } from "../../components/HttpMethodTag";
import { type ResolvedApiEndpointWithPackage } from "../../resolver/types";
import { BuiltWithFern } from "../../sidebar/BuiltWithFern";

const Markdown = dynamic(() => import("../../mdx/Markdown").then(({ Markdown }) => Markdown), { ssr: true });

export interface PlaygroundEndpointSelectorContentProps {
    apiGroups: ApiGroup[];
    closeDropdown?: () => void;
    selectedEndpoint?: FernNavigation.NavigationNodeApiLeaf;
    className?: string;
    nodeIdToApiDefinition: Map<FernNavigation.NodeId, ResolvedApiEndpointWithPackage>;
}

export interface ApiGroup {
    api: FernNavigation.ApiDefinitionId;
    id: FernNavigation.NodeId;
    breadcrumbs: readonly string[];
    items: FernNavigation.NavigationNodeApiLeaf[];
}

export function flattenApiSection(root: FernNavigation.SidebarRootNode | undefined): ApiGroup[] {
    if (root == null) {
        return [];
    }
    const result: ApiGroup[] = [];
    FernNavigation.utils.traverseNavigation(root, (node, _, parents) => {
        if (node.type === "changelog") {
            return "skip";
        }
        if (node.type === "apiReference" || node.type === "apiPackage") {
            // webhooks are not supported in the playground
            const items = node.children.filter(FernNavigation.isApiLeaf).filter((item) => item.type !== "webhook");
            if (items.length === 0) {
                return;
            }

            const breadcrumbs = FernNavigation.utils.createBreadcrumbs(parents).map((breadcrumb) => breadcrumb.title);
            result.push({
                api: node.apiDefinitionId,
                id: node.id,
                breadcrumbs,
                items,
            });
        }
        return;
    });

    if (result.length === 0) {
        return [];
    }

    /**
     * we want to get the lowest level of breadcrumbs shared by all groups
     * for example:
     * - [a, b, c]
     * - [a, b, d]
     *
     * the shared breadcrumbs would be [a, b], and the resulting breadcrumbs for each group would be [c] and [d]
     */
    const allBreadcrumbs = result.map((group) => group.breadcrumbs);
    const sharedBreadcrumbs = allBreadcrumbs.reduce((acc, breadcrumbs) => {
        return acc.filter((breadcrumb, idx) => breadcrumb === breadcrumbs[idx]);
    }, allBreadcrumbs[0] ?? EMPTY_ARRAY);

    return result.map((group) => ({
        ...group,
        breadcrumbs: group.breadcrumbs.slice(sharedBreadcrumbs.length),
    }));
}

function matchesEndpoint(query: string, group: ApiGroup, endpoint: FernNavigation.NavigationNodeApiLeaf): boolean {
    return (
        group.breadcrumbs.some((breadcrumb) => breadcrumb.toLowerCase().includes(query.toLowerCase())) ||
        endpoint.title?.toLowerCase().includes(query.toLowerCase()) ||
        (endpoint.type === "endpoint" && endpoint.method.toLowerCase().includes(query.toLowerCase()))
    );
}

export const PlaygroundEndpointSelectorContent = forwardRef<HTMLDivElement, PlaygroundEndpointSelectorContentProps>(
    ({ apiGroups, closeDropdown, selectedEndpoint, className, nodeIdToApiDefinition }, ref) => {
        const scrollRef = useRef<HTMLDivElement>(null);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        useImperativeHandle(ref, () => scrollRef.current!);

        const setSelectionStateAndOpen = useSetAndOpenPlayground();

        const [filterValue, setFilterValue] = useState<string>("");

        const selectedItemRef = useRef<HTMLLIElement>(null);

        useEffect(() => {
            selectedItemRef.current?.scrollIntoView({ block: "center" });
        }, []);

        const createSelectEndpoint = (endpoint: FernNavigation.NavigationNodeApiLeaf) => () => {
            setSelectionStateAndOpen(endpoint);
            closeDropdown?.();
        };

        function renderApiDefinitionPackage(apiGroup: ApiGroup) {
            const endpoints = apiGroup.items.filter((endpoint) => matchesEndpoint(filterValue, apiGroup, endpoint));
            if (endpoints.length === 0) {
                return null;
            }
            return (
                <li key={apiGroup.id}>
                    {apiGroup.breadcrumbs.length > 0 && (
                        <div className="flex h-[30px] items-center truncate px-3 py-1">
                            {apiGroup.breadcrumbs.map((breadcrumb, idx) => (
                                <Fragment key={idx}>
                                    {idx > 0 && <Slash className="size-icon-sm text-faded mx-0.5" />}
                                    <span className="t-accent shrink truncate whitespace-nowrap text-xs">
                                        {breadcrumb}
                                    </span>
                                </Fragment>
                            ))}
                        </div>
                    )}
                    <ul className="relative z-0 list-none">
                        {endpoints.map((endpointItem) => {
                            const apiDefinition = nodeIdToApiDefinition.get(endpointItem.id);
                            const active = endpointItem.id === selectedEndpoint?.id;
                            const text = renderTextWithHighlight(endpointItem.title, filterValue);
                            if (endpointItem.type === "endpoint") {
                                return (
                                    <li ref={active ? selectedItemRef : undefined} key={endpointItem.id}>
                                        <FernTooltip
                                            content={
                                                apiDefinition?.description != null ? (
                                                    <Markdown size="xs" mdx={apiDefinition.description} />
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
                                                onClick={createSelectEndpoint(endpointItem)}
                                                icon={
                                                    <HttpMethodTag
                                                        method={
                                                            endpointItem.isResponseStream
                                                                ? "STREAM"
                                                                : endpointItem.method
                                                        }
                                                        size="sm"
                                                        active={active}
                                                        className="mr-1"
                                                    />
                                                }
                                            />
                                        </FernTooltip>
                                    </li>
                                );
                            } else if (endpointItem.type === "webSocket") {
                                return (
                                    <li ref={active ? selectedItemRef : undefined} key={endpointItem.id}>
                                        <FernTooltip
                                            content={
                                                apiDefinition?.description != null ? (
                                                    <Markdown size="xs" mdx={apiDefinition.description} />
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
                                                onClick={createSelectEndpoint(endpointItem)}
                                                icon={<HttpMethodTag method="WSS" size="sm" className="mr-1" />}
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
                <div className={clsx("relative flex size-full flex-col", className)} ref={scrollRef}>
                    <div className={clsx("relative z-20 px-3 pb-0 pt-3")}>
                        <FernInput
                            leftIcon={<Search className="size-icon" />}
                            data-1p-ignore="true"
                            autoFocus={true}
                            value={filterValue}
                            onValueChange={setFilterValue}
                            rightElement={
                                filterValue.length > 0 && (
                                    <FernButton icon={<Xmark />} variant="minimal" onClick={() => setFilterValue("")} />
                                )
                            }
                            placeholder="Search for endpoints..."
                        />
                    </div>
                    <FernScrollArea
                        rootClassName="min-h-0 flex-1 shrink w-full"
                        className="mask-grad-y-6 !flex w-full"
                        scrollbars="vertical"
                        asChild
                        ref={ref}
                    >
                        <ul className="flex h-fit w-full list-none flex-col gap-4 p-3">{renderedListItems}</ul>
                        <div className="!h-6"></div>
                    </FernScrollArea>
                    <BuiltWithFern className="border-default bg-background border-t px-6 py-4" />
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
