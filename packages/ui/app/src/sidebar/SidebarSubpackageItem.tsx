import { Text } from "@blueprintjs/core";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import {
    getSlugForFirstNavigatableEndpointOrWebhook,
    isUnversionedTabbedNavigationConfig,
    UrlPathResolver,
} from "@fern-ui/app-utils";
import classNames from "classnames";
import { NextRouter } from "next/router";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { DocsInfo, NavigateToPathOpts } from "../docs-context/DocsContext";
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

    const handleClick = useCallback(async () => {
        const resolvedUrlPath = await urlPathResolver.resolveSlug(slug);
        if (resolvedUrlPath?.type === "apiSubpackage") {
            const apiId = resolvedUrlPath.apiSection.api;
            const apiDefinition = docsDefinition.apis[apiId];
            if (apiDefinition == null) {
                return;
            }
            const slugToNavigate = getSlugForFirstNavigatableEndpointOrWebhook(
                apiDefinition,
                [resolvedUrlPath.slug],
                resolvedUrlPath.subpackage
            );
            if (slugToNavigate != null) {
                void pushRoute(`/${slugToNavigate}`, undefined, {
                    shallow: isChildSelected,
                    scroll: !isChildSelected,
                });
                navigateToPath(slugToNavigate);
                closeMobileSidebar();
            }
        }
    }, [closeMobileSidebar, docsDefinition.apis, isChildSelected, navigateToPath, pushRoute, slug, urlPathResolver]);

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
