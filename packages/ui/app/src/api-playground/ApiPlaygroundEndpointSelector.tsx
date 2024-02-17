import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { isNonNullish } from "@fern-ui/core-utils";
import { useBooleanState, useKeyboardPress } from "@fern-ui/react-commons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon, ChevronUpIcon, Cross1Icon, MagnifyingGlassIcon, SlashIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { FC, ReactElement, useCallback, useRef, useState } from "react";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { FernButton } from "../components/FernButton";
import { FernInput } from "../components/FernInput";
import { FernScrollArea } from "../components/FernScrollArea";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";

export interface ApiPlaygroundEndpointSelectorProps {
    apiDefinition: ResolvedApiDefinitionPackage | undefined;
    endpoint: ResolvedEndpointDefinition | undefined;
    navigationItems: ResolvedNavigationItemApiSection[];
    popoverPlacement?: "bottom-start" | "bottom" | "bottom-end" | "top-start" | "top" | "top-end";
    placeholderText?: string;
    buttonClassName?: string;
}

function matchesEndpoint(query: string, endpoint: ResolvedEndpointDefinition): boolean {
    return (
        endpoint.name?.toLowerCase().includes(query.toLowerCase()) ||
        endpoint.description?.toLowerCase().includes(query.toLowerCase()) ||
        endpoint.method.toLowerCase().includes(query.toLowerCase())
    );
}

export const ApiPlaygroundEndpointSelector: FC<ApiPlaygroundEndpointSelectorProps> = ({
    apiDefinition,
    endpoint,
    navigationItems,
    placeholderText,
    buttonClassName,
}) => {
    const { setSelectionStateAndOpen } = useApiPlaygroundContext();
    const { value: showDropdown, toggleValue: toggleDropdown, setFalse: closeDropdown } = useBooleanState(false);

    const [filterValue, setFilterValue] = useState<string>("");

    const selectedItemRef = useRef<HTMLLIElement>(null);

    useKeyboardPress({ key: "Escape", onPress: closeDropdown });

    // // click anywhere outside the dropdown to close it
    // const dropdownRef = useRef<HTMLDivElement>(null);
    // useEffect(() => {
    //     if (!showDropdown) {
    //         return;
    //     }
    //     const listener = (e: MouseEvent) => {
    //         if (dropdownRef.current != null && !dropdownRef.current.contains(e.target as Node)) {
    //             closeDropdown();
    //         }
    //     };

    //     document.addEventListener("click", listener);

    //     return () => {
    //         document.removeEventListener("click", listener);
    //     };
    // }, [closeDropdown, showDropdown]);

    function renderApiDefinitionPackage(apiDefinition: ResolvedApiDefinitionPackage, depth: number) {
        const endpoints = apiDefinition.endpoints.filter((endpoint) => matchesEndpoint(filterValue, endpoint));
        const subpackages = apiDefinition.subpackages
            .map((subpackage) => renderApiDefinitionPackage(subpackage, depth + 1))
            .filter(isNonNullish);
        if (endpoints.length === 0 && subpackages.length === 0) {
            return null;
        }
        return (
            <li key={apiDefinition.type === "apiSection" ? apiDefinition.api : apiDefinition.id} className="gap-2">
                {depth >= 0 && (
                    <div
                        className="bg-background sticky z-10 flex h-[30px] items-center gap-2 px-3 py-1"
                        style={{
                            top: depth * 30,
                        }}
                    >
                        <span className="t-accent shrink truncate whitespace-nowrap text-xs">
                            {apiDefinition.title}
                        </span>
                    </div>
                )}
                <ul className="relative z-0 list-none">
                    {endpoints.map((endpointItem) => (
                        <li ref={endpointItem.id === endpoint?.id ? selectedItemRef : undefined} key={endpointItem.id}>
                            <FernButton
                                text={renderTextWithHighlight(endpointItem.name ?? "", filterValue)}
                                className="w-full rounded-none text-left"
                                variant="minimal"
                                onClick={() => {
                                    setSelectionStateAndOpen({
                                        endpoint: endpointItem,
                                        apiDefinition,
                                        apiSection:
                                            apiDefinition.type === "apiSection"
                                                ? apiDefinition
                                                : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                                  navigationItems.find(
                                                      (item) => item.api === apiDefinition.apiSectionId,
                                                  )!,
                                    });
                                    closeDropdown();
                                }}
                                rightIcon={<HttpMethodTag method={endpointItem.method} small={true} />}
                            />
                        </li>
                    ))}
                    {subpackages}
                </ul>
            </li>
        );
    }

    const renderedListItems = navigationItems
        .map((apiSection) => renderApiDefinitionPackage(apiSection, navigationItems.length === 1 ? -1 : 0))
        .filter(isNonNullish);

    const [isPopoverBelow, setIsPopoverBelow] = useState(true);

    const RightIcon = isPopoverBelow ? ChevronDownIcon : ChevronUpIcon;

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const handleOpen = useCallback(() => {
        // check if menuref is below buttonref, if not, set isPopoverBelow to false
        if (buttonRef.current != null && menuRef.current != null) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();
            setIsPopoverBelow(buttonRect.bottom < menuRect.top);
        }
    }, []);

    return (
        <DropdownMenu.Root onOpenChange={handleOpen}>
            <DropdownMenu.Trigger asChild={true}>
                <FernButton
                    ref={buttonRef}
                    className={classNames(buttonClassName, "max-w-full -my-1 !text-left")}
                    onClick={toggleDropdown}
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
                        {apiDefinition != null && (
                            <>
                                <span className="t-accent shrink truncate whitespace-nowrap">
                                    {apiDefinition.title}
                                </span>
                                <SlashIcon className="text-faded" />
                            </>
                        )}

                        <span className="whitespace-nowrap font-semibold">
                            {endpoint?.name ?? placeholderText ?? "Select an endpoint"}
                        </span>
                    </span>
                </FernButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content asChild={true} sideOffset={4} onAnimationStartCapture={handleOpen}>
                    <div className="fern-dropdown overflow-hidden rounded-xl" ref={menuRef}>
                        {isPopoverBelow && (
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
                        )}
                        <FernScrollArea>
                            <ul className="list-none">{renderedListItems}</ul>
                        </FernScrollArea>
                        {!isPopoverBelow && (
                            <div
                                className={classNames("relative z-20 px-1 pb-1", {
                                    "pt-1": renderedListItems.length === 0,
                                    "pt-0": renderedListItems.length > 0,
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
                        )}
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
            <mark className="bg-accent-highlight" key={idx}>
                {part}
            </mark>
        ) : (
            <span key={idx}>{part}</span>
        ),
    );
}
