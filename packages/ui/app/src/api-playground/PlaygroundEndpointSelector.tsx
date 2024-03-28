import { useBooleanState } from "@fern-ui/react-commons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon, SlashIcon } from "@radix-ui/react-icons";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import cn from "clsx";
import { FC, Fragment, useCallback, useRef } from "react";
import { withStream } from "../commons/withStream";
import { FernButton } from "../components/FernButton";
import { usePlaygroundContext } from "./PlaygroundContext";
import { ApiGroup, PlaygroundEndpointSelectorContent } from "./PlaygroundEndpointSelectorContent";

export interface PlaygroundEndpointSelectorProps {
    apiGroups: ApiGroup[];
    placeholderText?: string;
    buttonClassName?: string;
    disabled?: boolean;
}

export const PlaygroundEndpointSelector: FC<PlaygroundEndpointSelectorProps> = ({
    apiGroups,
    placeholderText,
    buttonClassName,
    disabled,
}) => {
    const { selectionState } = usePlaygroundContext();
    const { value: showDropdown, setFalse: closeDropdown, setValue: handleOpenChange } = useBooleanState(false);

    const selectedItemRef = useRef<HTMLLIElement>(null);

    const { endpoint: selectedEndpoint, group: selectedGroup } = apiGroups
        .flatMap((group) => [
            ...group.items
                .filter((item) => item.apiType === "endpoint" || item.apiType === "websocket")
                .map((endpoint) => ({ group, endpoint })),
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
                                    ? selectedEndpoint.apiType === "endpoint" && selectedEndpoint.stream
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
                            apiGroups={apiGroups}
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
