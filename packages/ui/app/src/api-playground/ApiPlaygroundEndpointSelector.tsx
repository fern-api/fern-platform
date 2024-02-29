import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon, Cross1Icon, MagnifyingGlassIcon, SlashIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { noop } from "lodash-es";
import dynamic from "next/dynamic";
import { FC, Fragment, ReactElement, useCallback, useMemo, useRef, useState } from "react";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { Chip } from "../components/Chip";
import { FernButton } from "../components/FernButton";
import { FernInput } from "../components/FernInput";
import { FernScrollArea } from "../components/FernScrollArea";
import { FernTooltip, FernTooltipProvider } from "../components/FernTooltip";
import { isEndpointPage, SidebarNode } from "../sidebar/types";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";

const Markdown = dynamic(() => import("../api-page/markdown/Markdown").then(({ Markdown }) => Markdown), { ssr: true });

export interface ApiPlaygroundEndpointSelectorProps {
    navigation: SidebarNode[];
    placeholderText?: string;
    buttonClassName?: string;
}

interface ApiGroup {
    api: FdrAPI.ApiId;
    id: string;
    breadcrumbs: string[];
    endpoints: SidebarNode.EndpointPage[];
    webhooks: SidebarNode.ApiPage[];
    websockets: SidebarNode.ApiPage[];
}

function isApiGroupNotEmpty(group: ApiGroup): boolean {
    return group.endpoints.length > 0 || group.webhooks.length > 0 || group.websockets.length > 0;
}

function flattenApiSection(navigation: SidebarNode[]): ApiGroup[] {
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
                    endpoints: apiSection.endpoints,
                    webhooks: apiSection.webhooks,
                    websockets: apiSection.websockets,
                });

                result.push(
                    ...flattenApiSection(apiSection.subpackages).map((group) => ({
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
        (isEndpointPage(endpoint) && endpoint.method.toLowerCase().includes(query.toLowerCase()))
    );
}

export const ApiPlaygroundEndpointSelector: FC<ApiPlaygroundEndpointSelectorProps> = ({
    navigation,
    placeholderText,
    buttonClassName,
}) => {
    const { setSelectionStateAndOpen, selectionState } = useApiPlaygroundContext();
    const { value: showDropdown, setFalse: closeDropdown, setValue: handleOpenChange } = useBooleanState(false);

    const [filterValue, setFilterValue] = useState<string>("");

    const selectedItemRef = useRef<HTMLLIElement>(null);

    const apiGroups = useMemo(() => flattenApiSection(navigation), [navigation]);

    const { endpoint: selectedEndpoint, group: selectedGroup } = apiGroups
        .flatMap((group) => [
            ...group.endpoints.map((endpoint) => ({ group, endpoint })),
            ...group.websockets.map((endpoint) => ({ group, endpoint })),
        ])
        .find(({ endpoint }) =>
            selectionState?.type === "endpoint"
                ? endpoint.slug.join("/") === selectionState?.endpointId
                : selectionState?.type === "websocket"
                  ? endpoint.slug.join("/") === selectionState?.webSocketId
                  : false,
        ) ?? {
        endpoint: undefined,
        group: undefined,
    };

    const createSelectEndpoint = (group: ApiGroup, endpoint: SidebarNode.EndpointPage) => () => {
        setSelectionStateAndOpen({
            type: "endpoint",
            api: group.api,
            endpointId: endpoint.slug.join("/"),
        });
        closeDropdown();
    };

    const createSelectWebSocket = (group: ApiGroup, websocket: SidebarNode.ApiPage) => () => {
        setSelectionStateAndOpen({
            type: "websocket",
            api: group.api,
            webSocketId: websocket.slug.join("/"),
        });
        closeDropdown();
    };

    function renderApiDefinitionPackage(apiGroup: ApiGroup) {
        const endpoints = apiGroup.endpoints.filter((endpoint) => matchesEndpoint(filterValue, apiGroup, endpoint));
        const websockets = apiGroup.websockets.filter((endpoint) => matchesEndpoint(filterValue, apiGroup, endpoint));
        if (endpoints.length === 0 && websockets.length === 0) {
            return null;
        }
        return (
            <li key={apiGroup.id} className="gap-2">
                {apiGroup.breadcrumbs.length > 1 && (
                    <div className="bg-background sticky top-0 z-10 flex h-[30px] items-center px-3 py-1">
                        {apiGroup.breadcrumbs.slice(1).map((breadcrumb, idx) => (
                            <Fragment key={idx}>
                                {idx > 0 && <SlashIcon className="text-faded mx-0.5 size-3" />}
                                <span className="t-accent shrink truncate whitespace-nowrap text-xs">{breadcrumb}</span>
                            </Fragment>
                        ))}
                    </div>
                )}
                <ul className="relative z-0 list-none">
                    {endpoints.map((endpointItem) => {
                        const active = endpointItem.slug.join("/") === selectedEndpoint?.slug.join("/");
                        const text = renderTextWithHighlight(endpointItem.title, filterValue);
                        return (
                            <li ref={active ? selectedItemRef : undefined} key={endpointItem.id}>
                                <FernTooltip
                                    content={
                                        endpointItem.description != null ? (
                                            <Markdown className="text-xs">{endpointItem.description}</Markdown>
                                        ) : undefined
                                    }
                                    side="right"
                                >
                                    <FernButton
                                        text={endpointItem.stream ? withStream(text) : text}
                                        className="w-full rounded-none text-left"
                                        variant="minimal"
                                        intent={active ? "primary" : "none"}
                                        active={active}
                                        onClick={createSelectEndpoint(apiGroup, endpointItem)}
                                        rightIcon={<HttpMethodTag method={endpointItem.method} small={true} />}
                                    />
                                </FernTooltip>
                            </li>
                        );
                    })}
                    {websockets.map((endpointItem) => {
                        const active = endpointItem.slug.join("/") === selectedEndpoint?.slug.join("/");
                        const text = renderTextWithHighlight(endpointItem.title, filterValue);
                        return (
                            <li ref={active ? selectedItemRef : undefined} key={endpointItem.id}>
                                <FernTooltip
                                    content={
                                        endpointItem.description != null ? (
                                            <Markdown className="text-xs">{endpointItem.description}</Markdown>
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
                                        rightIcon={<Chip name="WSS" description={null} small />}
                                    />
                                </FernTooltip>
                            </li>
                        );
                    })}
                </ul>
            </li>
        );
    }

    const renderedListItems = apiGroups.map((group) => renderApiDefinitionPackage(group)).filter(isNonNullish);

    const RightIcon = ChevronDownIcon;

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const shouldScrollIntoView = useRef(false);
    const determinePlacement = useCallback(() => {
        if (shouldScrollIntoView.current) {
            selectedItemRef.current?.scrollIntoView({ block: "center" });
        }
        shouldScrollIntoView.current = false;
    }, []);

    return (
        <DropdownMenu.Root
            onOpenChange={(open) => {
                handleOpenChange(open);
                shouldScrollIntoView.current = open;
            }}
            open={showDropdown}
        >
            <DropdownMenu.Trigger asChild={true}>
                <FernButton
                    ref={buttonRef}
                    className={classNames(buttonClassName, "max-w-full -my-1 !text-left")}
                    active={showDropdown}
                    rightIcon={
                        <RightIcon
                            className={classNames("transition-transform", {
                                "rotate-180": showDropdown,
                            })}
                        />
                    }
                    variant="minimal"
                >
                    <span className="inline-flex items-center gap-1">
                        {selectedGroup != null &&
                            selectedGroup.breadcrumbs.length > 1 &&
                            selectedGroup.breadcrumbs.slice(1).map((breadcrumb, idx) => (
                                <Fragment key={idx}>
                                    <span className="t-accent shrink truncate whitespace-nowrap">{breadcrumb}</span>
                                    <SlashIcon className="text-faded" />
                                </Fragment>
                            ))}

                        <span className="whitespace-nowrap font-semibold">
                            {selectedEndpoint?.title ?? placeholderText ?? "Select an endpoint"}
                        </span>
                    </span>
                </FernButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content asChild={true} sideOffset={4} ref={determinePlacement}>
                    <div className="fern-dropdown min-w-[300px] overflow-hidden rounded-xl" ref={menuRef}>
                        <div
                            className={classNames("relative z-20 px-1 pt-1", {
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
                        <FernScrollArea>
                            <FernTooltipProvider>
                                <ul className="list-none">{renderedListItems}</ul>
                            </FernTooltipProvider>
                        </FernScrollArea>
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

function renderTextWithHighlight(text: string, highlight: string): ReactElement[] {
    highlight = highlight.trim();
    // Split text on higlight term, include term itself into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, idx) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
            <mark className="bg-accent-highlight t-default" key={idx}>
                {part}
            </mark>
        ) : (
            <span key={idx}>{part}</span>
        ),
    );
}

function withStream(text: ReactElement[]): ReactElement[] {
    return [
        ...text,
        <span
            key="stream"
            className="bg-accent-primary/10 dark:bg-accent-primary-dark/10 text-accent-primary dark:text-accent-primary-dark flex items-center rounded-[4px] p-0.5 font-mono text-xs uppercase leading-none"
        >
            stream
        </span>,
    ];
}
