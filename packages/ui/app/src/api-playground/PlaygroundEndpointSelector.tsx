import { FdrAPI } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon, SlashIcon } from "@radix-ui/react-icons";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import cn from "clsx";
import { noop } from "lodash-es";
import { FC, Fragment, useCallback, useMemo, useRef } from "react";
import { withStream } from "../commons/withStream";
import { FernButton } from "../components/FernButton";
import { SidebarNode } from "../sidebar/types";
import { usePlaygroundContext } from "./PlaygroundContext";
import { PlaygroundEndpointSelectorContent } from "./PlaygroundEndpointSelectorContent";

export interface PlaygroundEndpointSelectorProps {
    navigation: SidebarNode[];
    placeholderText?: string;
    buttonClassName?: string;
    disabled?: boolean;
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
export const PlaygroundEndpointSelector: FC<PlaygroundEndpointSelectorProps> = ({
    navigation,
    placeholderText,
    buttonClassName,
    disabled,
}) => {
    const { selectionState } = usePlaygroundContext();
    const { value: showDropdown, setFalse: closeDropdown, setValue: handleOpenChange } = useBooleanState(false);

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

    const RightIcon = ChevronDownIcon;

    const buttonRef = useRef<HTMLButtonElement>(null);
    const shouldScrollIntoView = useRef(false);
    const determinePlacement = useCallback(() => {
        if (shouldScrollIntoView.current) {
            selectedItemRef.current?.scrollIntoView({ block: "center" });
        }
        shouldScrollIntoView.current = false;
    }, []);

    return (
        <TooltipProvider>
            <DropdownMenu.Root
                onOpenChange={(open) => {
                    handleOpenChange(open);
                    shouldScrollIntoView.current = open;
                }}
                open={showDropdown}
            >
                <DropdownMenu.Trigger asChild={true} disabled={disabled}>
                    <FernButton
                        ref={buttonRef}
                        className={cn(buttonClassName, "max-w-full -my-1 !text-left")}
                        active={showDropdown}
                        rightIcon={
                            <RightIcon
                                className={cn("transition-transform", {
                                    "rotate-180": showDropdown,
                                })}
                            />
                        }
                        variant="minimal"
                    >
                        <span className="inline-flex items-center gap-1">
                            {selectedGroup != null &&
                                selectedGroup.breadcrumbs.length > 0 &&
                                selectedGroup.breadcrumbs.map((breadcrumb, idx) => (
                                    <Fragment key={idx}>
                                        <span className="t-accent shrink truncate whitespace-nowrap">{breadcrumb}</span>
                                        <SlashIcon className="text-faded" />
                                    </Fragment>
                                ))}

                            <span className="whitespace-nowrap font-semibold">
                                {selectedEndpoint != null
                                    ? selectedEndpoint.id.endsWith("_stream")
                                        ? withStream(selectedEndpoint.title)
                                        : selectedEndpoint.title
                                    : placeholderText ?? "Select an endpoint"}
                            </span>
                        </span>
                    </FernButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content sideOffset={4} ref={determinePlacement} className="fern-dropdown rounded-xl">
                        <PlaygroundEndpointSelectorContent
                            navigation={navigation}
                            closeDropdown={closeDropdown}
                            selectedEndpoint={selectedEndpoint}
                            className="h-full"
                        />
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </TooltipProvider>
    );
};
