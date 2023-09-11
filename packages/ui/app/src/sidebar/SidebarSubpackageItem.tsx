import { Text } from "@blueprintjs/core";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { isUnversionedTabbedNavigationConfig, UrlPathResolver } from "@fern-ui/app-utils";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { DocsInfo, NavigateToPathOpts } from "../docs-context/DocsContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarSubpackageItem {
    export interface Props {
        title: JSX.Element | string;
        isChildSelected: boolean;
        className?: string;
        slug: string;
        shallow: boolean;
    }
}

const UnmemoizedSidebarSubpackageItem: React.FC<SidebarSubpackageItem.Props> = ({
    title,
    isChildSelected,
    className,
    slug,
    shallow,
}) => {
    const urlPathResolver = useMemo(() => {
        let items;
        if (isUnversionedTabbedNavigationConfig(docsInfo.activeNavigationConfig)) {
            const activeTab = docsInfo.activeNavigationConfig.tabs[activeTabIndex];
            if (activeTab == null) {
                throw new Error(
                    `Cannot find the tab with index ${activeTabIndex}. This indicates a bug with implementation.`
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
    }, [docsDefinition, docsInfo, activeTabIndex]);

    const handleClick = useCallback(async () => {
        const resolvedUrlPath = await urlPathResolver.resolveSlug(slug);
        if (resolvedUrlPath?.type === "apiSubpackage") {
            const firstNavigatable = resolvedUrlPath.subpackage.endpoints[0] ?? resolvedUrlPath.subpackage.webhooks[0];
            if (firstNavigatable != null) {
                const slugToNavigate = joinUrlSlugs(resolvedUrlPath.slug, firstNavigatable.urlSlug);
                void router.push("/" + getFullSlug(slugToNavigate), undefined, { shallow, scroll: !shallow });
                navigateToPath(slugToNavigate);
                closeMobileSidebar();
            }
        }
    }, [urlPathResolver, slug, router, getFullSlug, shallow, navigateToPath, closeMobileSidebar]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullSlug]);

    return (
        <button className={classNames(className)} ref={ref} onClick={handleClick}>
            <SidebarItemLayout title={renderTitle} />
        </button>
    );
};
export const SidebarSubpackageItem = memo(
    UnmemoizedSidebarSubpackageItem,
    (prev, next) => prev.isChildSelected === next.isChildSelected
);
