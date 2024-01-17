import { Button, InputGroup } from "@blueprintjs/core";
import { Cross, Search } from "@blueprintjs/icons";
import { APIV1Read, joinUrlSlugs } from "@fern-api/fdr-sdk";
import { getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import { useBooleanState, useKeyboardPress } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { FC, Fragment, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { resolveSubpackage } from "../api-context/ApiDefinitionContextProvider";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useNavigationContext } from "../navigation-context";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";

export interface ApiPlaygroundEndpointSelectorProps {
    endpoint: APIV1Read.EndpointDefinition | undefined;
    package: APIV1Read.ApiDefinitionPackage | undefined;
    popoverPlacement?: "bottom-start" | "bottom" | "bottom-end" | "top-start" | "top" | "top-end";
    placeholderText?: string;
    buttonClassName?: string;
}

interface PackageAndApiId {
    apiId: string;
    package: APIV1Read.ApiDefinitionPackage;
    parents: APIV1Read.ApiDefinitionPackage[];
    slug: string;
}

export const ApiPlaygroundEndpointSelector: FC<ApiPlaygroundEndpointSelectorProps> = ({
    endpoint,
    package: package_,
    popoverPlacement = "bottom",
    placeholderText,
    buttonClassName,
}) => {
    const { setSelectionStateAndOpen } = useApiPlaygroundContext();
    const { value: showDropdown, toggleValue: toggleDropdown, setFalse: closeDropdown } = useBooleanState(false);
    const { resolveApi } = useDocsContext();
    const { activeNavigationConfigContext } = useDocsSelectors();
    const { activeNavigatable } = useNavigationContext();

    const [filterValue, setFilterValue] = useState<string>("");

    const navigationItems =
        activeNavigationConfigContext.type === "tabbed"
            ? activeNavigatable.context.tab?.items
            : activeNavigationConfigContext.config.items;

    const packages = useMemo<PackageAndApiId[]>(() => {
        if (navigationItems == null) {
            return [];
        }

        return navigationItems.flatMap((item) => {
            if (item.type !== "api") {
                return [];
            }

            const apiDefinition = resolveApi(item.api);

            if (apiDefinition == null) {
                return [];
            }

            const flattenSubpackages = (
                subpackageId: APIV1Read.SubpackageId,
                parents: APIV1Read.ApiDefinitionPackage[],
                slug: string
            ): PackageAndApiId[] => {
                const subpackage = resolveSubpackage(apiDefinition, subpackageId);

                if (subpackage == null) {
                    return [];
                }

                const parentSlug = joinUrlSlugs(slug, subpackage.urlSlug);

                return [
                    { apiId: item.api, package: subpackage, parents, slug: parentSlug },
                    ...subpackage.subpackages.flatMap((subpackageId) =>
                        flattenSubpackages(subpackageId, [...parents, subpackage], parentSlug)
                    ),
                ];
            };

            const parentSlug = joinUrlSlugs(item.urlSlug);

            return [
                { apiId: item.api, package: apiDefinition.rootPackage, parents: [], slug: parentSlug },
                ...apiDefinition.rootPackage.subpackages.flatMap((subpackageId) =>
                    flattenSubpackages(subpackageId, [apiDefinition.rootPackage], parentSlug)
                ),
            ];
        });
    }, [navigationItems, resolveApi]);

    const filteredPackages = useMemo<PackageAndApiId[]>(() => {
        const filterValueCleaned = filterValue.trim().toLowerCase();
        if (filterValueCleaned.length === 0) {
            return packages;
        }

        return packages.flatMap(({ package: package_, apiId, parents, slug }) => {
            const endpoints = package_.endpoints.filter(
                (endpoint) =>
                    endpoint.name?.toLowerCase().includes(filterValueCleaned.toLowerCase()) ||
                    endpoint.description?.toLowerCase().includes(filterValueCleaned.toLowerCase()) ||
                    endpoint.method.toLowerCase().includes(filterValueCleaned.toLowerCase())
            );

            if (endpoints.length === 0) {
                return [];
            }

            return [
                {
                    apiId,
                    package: {
                        ...package_,
                        endpoints,
                    },
                    parents,
                    slug,
                },
            ];
        });
    }, [filterValue, packages]);

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
                {package_ != null && isSubpackage(package_) && (
                    <span className="text-accent-primary dark:text-accent-primary-dark shrink truncate whitespace-nowrap text-xs">
                        {getSubpackageTitle(package_)}
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
                                "pb-1": filteredPackages.length === 0,
                                "pb-0": filteredPackages.length > 0,
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
                    <ul className="scroll-contain list-none overflow-y-auto">
                        {filteredPackages.map(({ package: packageItem, apiId, parents, slug }, idx) =>
                            isSubpackage(packageItem) && packageItem.endpoints.length > 0 ? (
                                <li key={idx}>
                                    {isSubpackage(packageItem) && (
                                        <div className="bg-background dark:bg-background-dark border-border-default-light dark:border-border-default-dark sticky top-0 gap-2 border-b px-3 py-1">
                                            {parents.map(
                                                (parent, idx) =>
                                                    isSubpackage(parent) && (
                                                        <span
                                                            key={idx}
                                                            className="text-accent-primary dark:text-accent-primary-dark mr-2 shrink truncate whitespace-nowrap text-xs"
                                                        >
                                                            {getSubpackageTitle(parent)}
                                                        </span>
                                                    )
                                            )}
                                            <span className="text-accent-primary dark:text-accent-primary-dark shrink truncate whitespace-nowrap text-xs">
                                                {getSubpackageTitle(packageItem)}
                                            </span>
                                        </div>
                                    )}
                                    {packageItem.endpoints.length > 0 && (
                                        <ul className="mb-2 list-none py-1">
                                            {packageItem.endpoints.map((endpointItem) => (
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
                                                            apiId,
                                                            endpoint: endpointItem,
                                                            package: packageItem,
                                                            slug: joinUrlSlugs(slug, endpointItem.urlSlug),
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
                                        </ul>
                                    )}
                                </li>
                            ) : null
                        )}
                    </ul>
                    {popoverPlacement.startsWith("top") && (
                        <div
                            className={classNames("relative z-10 px-1 pb-1", {
                                "pt-1": filteredPackages.length === 0,
                                "pt-0": filteredPackages.length > 0,
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
