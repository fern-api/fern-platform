import { Text } from "@blueprintjs/core";
import { ApiDefinitionId } from "@fern-fern/registry-browser/api";
import { ApiDefinitionSubpackage } from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { isUnversionedTabbedNavigationConfig, UrlPathResolver } from "@fern-ui/app-utils";
import classNames from "classnames";
import { NextRouter } from "next/router";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { DocsInfo, NavigateToPathOpts } from "../docs-context/DocsContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { useDocsContext } from "../docs-context/useDocsContext";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarSubpackageItem {
    export interface Props {
        title: JSX.Element | string;
        isChildSelected: boolean;
        className?: string;
        slug: string;
        navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts | undefined) => void;
        registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
        getFullSlug: (slug: string) => string;
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        docsInfo: DocsInfo;
        activeTabIndex: number | null;
        closeMobileSidebar: () => void;
        pushRoute: NextRouter["push"];
    }
}

const UnmemoizedSidebarSubpackageItem: React.FC<SidebarSubpackageItem.Props> = ({
    title,
    isChildSelected,
    className,
    slug,
    navigateToPath,
    registerScrolledToPathListener,
    getFullSlug,
    docsDefinition,
    docsInfo,
    closeMobileSidebar,
    pushRoute,
}) => {
    const { activeTab } = useDocsContext();

    const urlPathResolver = useMemo(() => {
        let items;
        if (isUnversionedTabbedNavigationConfig(docsInfo.activeNavigationConfig)) {
            if (activeTab == null) {
                throw new Error(
                    "Active tab is null. This indicates an implementation bug as tabbed docs must have an active tab at all times."
                );
            }
            items = activeTab.items;
        } else {
            items = docsInfo.activeNavigationConfig.items;
        }
        return new UrlPathResolver({
            items,
            loadApiDefinition: (id) => docsDefinition.apis[id],
            loadApiPage: (id) => docsDefinition.pages[id],
        });
    }, [docsDefinition, docsInfo.activeNavigationConfig, activeTab]);

    /**
     * @returns Whether navigation was successful
     */
    const navigateToSubpackageFirstChild = useCallback(
        (apiId: ApiDefinitionId, slugs: string[], subpackage: ApiDefinitionSubpackage) => {
            const firstNavigatable = subpackage.endpoints[0] ?? subpackage.webhooks[0];
            if (firstNavigatable != null) {
                // Navigate to the endpoint or webhook page
                const slugToNavigate = joinUrlSlugs(...(slugs as [string, ...string[]]), firstNavigatable.urlSlug);
                void pushRoute("/" + getFullSlug(slugToNavigate), undefined, {
                    shallow: isChildSelected,
                    scroll: !isChildSelected,
                });
                navigateToPath(slugToNavigate);
                closeMobileSidebar();
                return true;
            } else {
                // Check if it has nested subpackages
                let i = 0;
                while (i < subpackage.subpackages.length) {
                    const childSubpackageId = subpackage.subpackages[i];
                    if (childSubpackageId != null) {
                        const childSubpackage = docsDefinition.apis[apiId]?.subpackages[childSubpackageId];
                        if (childSubpackage != null) {
                            const success = navigateToSubpackageFirstChild(
                                apiId,
                                [...slugs, childSubpackage.urlSlug],
                                childSubpackage
                            );
                            if (success) {
                                return true;
                            }
                        }
                    }
                    i++;
                }
                return false;
            }
        },
        [closeMobileSidebar, docsDefinition.apis, getFullSlug, isChildSelected, navigateToPath, pushRoute]
    );

    const handleClick = useCallback(async () => {
        const resolvedUrlPath = await urlPathResolver.resolveSlug(slug);
        if (resolvedUrlPath?.type === "apiSubpackage") {
            const apiId = resolvedUrlPath.apiSection.api;
            navigateToSubpackageFirstChild(apiId, [resolvedUrlPath.slug], resolvedUrlPath.subpackage);
        }
    }, [navigateToSubpackageFirstChild, slug, urlPathResolver]);

    const fullSlug = getFullSlug(slug);

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <div
                    className={classNames(
                        "flex flex-1 py-2 px-3 rounded-lg justify-start items-center select-none min-w-0",
                        {
                            "bg-tag-default-light dark:bg-tag-default-dark text-text-primary-light dark:text-text-primary-dark":
                                isHovering,
                            "t-muted": !isHovering,
                        }
                    )}
                >
                    <div className="flex min-w-0 items-center justify-start space-x-2">
                        <div className="min-w-fit">
                            <ChevronDownIcon
                                className={classNames("text-sm h-5 w-5 -ml-[6px] transition-transform", {
                                    "-rotate-90": !isChildSelected,
                                    "rotate-0": isChildSelected,
                                })}
                            />
                        </div>

                        <Text ellipsize>{title}</Text>
                    </div>
                </div>
            );
        },
        [isChildSelected, title]
    );

    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        return registerScrolledToPathListener(fullSlug, () => {
            ref.current?.scrollIntoView({ block: "nearest" });
        });
    }, [fullSlug, registerScrolledToPathListener]);

    return (
        <button className={classNames(className)} ref={ref} onClick={handleClick}>
            <SidebarItemLayout title={renderTitle} />
        </button>
    );
};

export const SidebarSubpackageItem = memo(
    UnmemoizedSidebarSubpackageItem,
    (prev, next) =>
        prev.isChildSelected === next.isChildSelected &&
        prev.getFullSlug === next.getFullSlug &&
        prev.slug === next.slug
);
