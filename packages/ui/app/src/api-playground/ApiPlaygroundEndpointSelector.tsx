import { Button, InputGroup } from "@blueprintjs/core";
import { Cross, Search } from "@blueprintjs/icons";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { isNonNullish } from "@fern-ui/core-utils";
import { useBooleanState, useKeyboardPress } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { FC, Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
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
    popoverPlacement = "bottom",
    placeholderText,
    buttonClassName,
}) => {
    const { setSelectionStateAndOpen } = useApiPlaygroundContext();
    const { value: showDropdown, toggleValue: toggleDropdown, setFalse: closeDropdown } = useBooleanState(false);

    const [filterValue, setFilterValue] = useState<string>("");

    // const endpointsWithRef = useMemo<EndpointWithRef[]>(() => {
    //     return navigationItems.flatMap((apiSection) => {
    //         const flattenSubpackages = (
    //             apiDefinition: ResolvedApiDefinitionPackage,
    //             parents: ResolvedApiDefinitionPackage[]
    //         ): EndpointWithRef[] => [
    //             ...apiDefinition.endpoints.map((endpoint) => ({
    //                 endpoint,
    //                 apiSection,
    //                 apiDefinition,
    //                 parents,
    //             })),
    //             ...apiDefinition.subpackages.flatMap((subpackage) =>
    //                 flattenSubpackages(subpackage, [...parents, subpackage])
    //             ),
    //         ];

    //         return flattenSubpackages(apiSection, []);
    //     });
    // }, [navigationItems]);

    // const selectedEndpointWithRef = useMemo<EndpointWithRef | undefined>(() => {
    //     return endpointsWithRef.find(({ endpoint: endpointItem }) => endpointItem.id === endpoint?.id);
    // }, [endpoint?.id, endpointsWithRef]);

    // const filteredEndpointsWithRef = useMemo<EndpointWithRef[]>(() => {
    //     const filterValueCleaned = filterValue.trim().toLowerCase();
    //     if (filterValueCleaned.length === 0) {
    //         return endpointsWithRef;
    //     }

    //     return endpointsWithRef.filter(({ endpoint }) => {
    //         return (
    //             endpoint.name?.toLowerCase().includes(filterValueCleaned.toLowerCase()) ||
    //             endpoint.description?.toLowerCase().includes(filterValueCleaned.toLowerCase()) ||
    //             endpoint.method.toLowerCase().includes(filterValueCleaned.toLowerCase())
    //         );
    //     });
    // }, [filterValue, endpointsWithRef]);

    const selectedItemRef = useRef<HTMLLIElement>(null);

    useKeyboardPress({ key: "Escape", onPress: closeDropdown });

    // click anywhere outside the dropdown to close it
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!showDropdown) {
            return;
        }
        const listener = (e: MouseEvent) => {
            if (dropdownRef.current != null && !dropdownRef.current.contains(e.target as Node)) {
                closeDropdown();
            }
        };

        document.addEventListener("click", listener);

        return () => {
            document.removeEventListener("click", listener);
        };
    }, [closeDropdown, showDropdown]);

    function renderApiDefinitionPackage(apiDefinition: ResolvedApiDefinitionPackage) {
        const endpoints = apiDefinition.endpoints.filter((endpoint) => matchesEndpoint(filterValue, endpoint));
        const subpackages = apiDefinition.subpackages.map(renderApiDefinitionPackage).filter(isNonNullish);
        if (endpoints.length === 0 && subpackages.length === 0) {
            return null;
        }
        return (
            <li key={apiDefinition.type === "apiSection" ? apiDefinition.api : apiDefinition.id}>
                <div className="bg-background dark:bg-background-dark border-border-default-light dark:border-border-default-dark sticky top-0 gap-2 border-b px-3 py-1">
                    <span className="text-accent-primary dark:text-accent-primary-dark shrink truncate whitespace-nowrap text-xs">
                        {apiDefinition.title}
                    </span>
                </div>
                <ul className="mb-2 list-none py-1">
                    {endpoints.map((endpointItem) => (
                        <li
                            ref={endpointItem.id === endpoint?.id ? selectedItemRef : undefined}
                            key={endpointItem.id}
                            className={classNames(
                                "gap-4 scroll-m-2 mx-1 flex h-8 cursor-pointer items-center rounded px-2 py-1 text-sm justify-between",
                                {
                                    "bg-tag-primary dark:bg-tag-primary-dark text-accent-primary dark:text-accent-primary-dark":
                                        endpointItem.id === endpoint?.id,
                                    "hover:bg-tag-default-light dark:hover:bg-tag-default-dark hover:text-accent-primary dark:hover:text-accent-primary-dark":
                                        endpointItem.id !== endpoint?.id,
                                }
                            )}
                            onClick={() => {
                                setSelectionStateAndOpen({
                                    endpoint: endpointItem,
                                    apiDefinition,
                                    apiSection:
                                        apiDefinition.type === "apiSection"
                                            ? apiDefinition
                                            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                              navigationItems.find((item) => item.api === apiDefinition.apiSectionId)!,
                                });
                                closeDropdown();
                            }}
                        >
                            <span className="whitespace-nowrap">
                                {renderTextWithHighlight(endpointItem.name ?? "", filterValue)}
                            </span>

                            <HttpMethodTag method={endpointItem.method} small={true} />
                        </li>
                    ))}
                    {subpackages}
                </ul>
            </li>
        );
    }

    const renderedListItems = navigationItems.map(renderApiDefinitionPackage).filter(isNonNullish);

    return (
        <div className="relative -ml-2 min-w-0 shrink">
            <button
                className={classNames(
                    buttonClassName,
                    "max-w-full flex cursor-pointer items-center gap-2 rounded px-2 py-1 -my-1 text-left hover:bg-black/10 hover:dark:bg-white/10",
                    {
                        "bg-black/10 dark:bg-white/10": showDropdown,
                        "text-sm": buttonClassName == null,
                    }
                )}
                onClick={toggleDropdown}
            >
                {apiDefinition != null && (
                    <span className="text-accent-primary dark:text-accent-primary-dark shrink truncate whitespace-nowrap text-xs">
                        {apiDefinition.title}
                    </span>
                )}

                <span className="whitespace-nowrap">{endpoint?.name ?? placeholderText ?? "Select an endpoint"}</span>
                <ChevronDownIcon
                    className={classNames("h-5 w-5 transition", {
                        "rotate-180": showDropdown,
                    })}
                />
            </button>
            <Transition
                show={showDropdown}
                as={Fragment}
                enter="ease-out transition-opacity transition-transform"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in transition-opacity transition-transform"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
                beforeEnter={() => {
                    selectedItemRef.current?.scrollIntoView({
                        block: "center",
                        inline: "nearest",
                    });
                }}
            >
                <div
                    ref={dropdownRef}
                    className={classNames(
                        "bg-background dark:bg-background-dark border-border-default-light dark:border-border-default-dark absolute z-10 flex max-h-96 min-h-4 min-w-fit flex-col rounded border shadow-xl min-w-full",
                        {
                            "origin-top-left left-0 top-full mt-2": popoverPlacement === "bottom-start",
                            "origin-top -translate-x-[50%] left-[50%] top-full mt-2": popoverPlacement === "bottom",
                            "origin-top-right right-0 top-full mt-2": popoverPlacement === "bottom-end",
                            "origin-bottom-left left-0 bottom-full mb-2": popoverPlacement === "top-start",
                            "origin-bottom -translate-x-[50%] left-[50%] bottom-full mb-2": popoverPlacement === "top",
                            "origin-bottom-right right-0 bottom-full mb-2": popoverPlacement === "top-end",
                        }
                    )}
                >
                    {popoverPlacement.startsWith("bottom") && (
                        <div
                            className={classNames("relative z-10 px-1 pt-1", {
                                "pb-1": renderedListItems.length === 0,
                                "pb-0": renderedListItems.length > 0,
                            })}
                        >
                            <InputGroup
                                fill={true}
                                leftIcon={<Search />}
                                data-1p-ignore="true"
                                autoFocus={true}
                                value={filterValue}
                                onValueChange={setFilterValue}
                                rightElement={
                                    filterValue.length > 0 && (
                                        <Button icon={<Cross />} minimal={true} onClick={() => setFilterValue("")} />
                                    )
                                }
                            />
                        </div>
                    )}
                    <ul className="scroll-contain list-none overflow-y-auto">{renderedListItems}</ul>
                    {popoverPlacement.startsWith("top") && (
                        <div
                            className={classNames("relative z-10 px-1 pb-1", {
                                "pt-1": renderedListItems.length === 0,
                                "pt-0": renderedListItems.length > 0,
                            })}
                        >
                            <InputGroup
                                fill={true}
                                leftIcon={<Search />}
                                data-1p-ignore="true"
                                autoFocus={true}
                                value={filterValue}
                                onValueChange={setFilterValue}
                                rightElement={
                                    filterValue.length > 0 && (
                                        <Button icon={<Cross />} minimal={true} onClick={() => setFilterValue("")} />
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            </Transition>
        </div>
    );
};

function renderTextWithHighlight(text: string, highlight: string): ReactElement[] {
    highlight = highlight.trim();
    // Split text on higlight term, include term itself into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, idx) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
            <mark className="bg-accent-highlight dark:bg-accent-highlight-dark" key={idx}>
                {part}
            </mark>
        ) : (
            <span key={idx}>{part}</span>
        )
    );
}
