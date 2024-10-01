import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernInput, FernScrollArea, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { isNonNullish } from "@fern-ui/core-utils";
import cn, { clsx } from "clsx";
import { Search, Slash, Xmark } from "iconoir-react";
import { Fragment, ReactElement, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useSetAndOpenPlayground } from "../../atoms";
import { HttpMethodTag } from "../../components/HttpMethodTag";
import { BuiltWithFern } from "../../sidebar/BuiltWithFern";
import { usePreloadApiLeaf } from "../hooks/usePreloadApiLeaf";
import { ApiGroup } from "../utils/flatten-apis";

// const Markdown = dynamic(() => import("../../mdx/Markdown").then(({ Markdown }) => Markdown), { ssr: true });

export interface PlaygroundEndpointSelectorContentProps {
    apiGroups: ApiGroup[];
    closeDropdown?: () => void;
    selectedEndpoint?: FernNavigation.NavigationNodeApiLeaf;
    className?: string;
    // nodeIdToApiDefinition: Map<FernNavigation.NodeId, ResolvedApiEndpointWithPackage>;
}

function matchesEndpoint(query: string, group: ApiGroup, endpoint: FernNavigation.NavigationNodeApiLeaf): boolean {
    return (
        group.breadcrumb.some((breadcrumb) => breadcrumb.toLowerCase().includes(query.toLowerCase())) ||
        endpoint.title?.toLowerCase().includes(query.toLowerCase()) ||
        (endpoint.type === "endpoint" && endpoint.method.toLowerCase().includes(query.toLowerCase()))
    );
}

export const PlaygroundEndpointSelectorContent = forwardRef<HTMLDivElement, PlaygroundEndpointSelectorContentProps>(
    ({ apiGroups, closeDropdown, selectedEndpoint, className }, ref) => {
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
            void setSelectionStateAndOpen(endpoint);
            closeDropdown?.();
        };

        const preload = usePreloadApiLeaf();

        function renderApiDefinitionPackage(apiGroup: ApiGroup) {
            const endpoints = apiGroup.items.filter((endpoint) => matchesEndpoint(filterValue, apiGroup, endpoint));
            if (endpoints.length === 0) {
                return null;
            }
            return (
                <li key={apiGroup.id}>
                    {apiGroup.breadcrumb.length > 0 && (
                        <div className="flex h-[30px] items-center px-3 py-1 truncate">
                            {apiGroup.breadcrumb.map((breadcrumb, idx) => (
                                <Fragment key={idx}>
                                    {idx > 0 && <Slash className="mx-0.5 size-icon-sm text-faded" />}
                                    <span className="t-accent shrink truncate whitespace-nowrap text-xs">
                                        {breadcrumb}
                                    </span>
                                </Fragment>
                            ))}
                        </div>
                    )}
                    <ul className="relative z-0 list-none">
                        {endpoints.map((endpointItem) => {
                            // const apiDefinition = nodeIdToApiDefinition.get(endpointItem.id);
                            const active = endpointItem.id === selectedEndpoint?.id;
                            const text = renderTextWithHighlight(endpointItem.title, filterValue);
                            if (endpointItem.type === "endpoint") {
                                return (
                                    <li ref={active ? selectedItemRef : undefined} key={endpointItem.id}>
                                        <FernTooltip
                                            // TODO: grab description from the API definition from global state
                                            content={undefined}
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
                                                onMouseEnter={() => void preload(endpointItem)}
                                            />
                                        </FernTooltip>
                                    </li>
                                );
                            } else if (endpointItem.type === "webSocket") {
                                return (
                                    <li ref={active ? selectedItemRef : undefined} key={endpointItem.id}>
                                        <FernTooltip
                                            // TODO: grab description from the API definition from global state
                                            content={undefined}
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
                                                onMouseEnter={() => void preload(endpointItem)}
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
                        className="mask-grad-y-6 w-full !flex"
                        scrollbars="vertical"
                        asChild
                        ref={ref}
                    >
                        <ul className="list-none p-3 flex flex-col gap-4 w-full h-fit">{renderedListItems}</ul>
                        <div className="!h-6"></div>
                    </FernScrollArea>
                    <BuiltWithFern className="border-t border-default py-4 px-6 bg-background" />
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
