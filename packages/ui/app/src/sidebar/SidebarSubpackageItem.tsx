import { Text } from "@blueprintjs/core";
import { isUnversionedTabbedNavigationConfig, UrlPathResolver } from "@fern-ui/app-utils";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { useSidebarContext } from "./context/useSidebarContext";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarSubpackageItem {
    export interface Props {
        title: JSX.Element | string;
        isChildSelected: boolean;
        className?: string;
        slug: string;
    }
}

export const SidebarSubpackageItem: React.FC<SidebarSubpackageItem.Props> = ({
    title,
    isChildSelected,
    className,
    slug,
}) => {
    const { navigateToPath, registerScrolledToPathListener, getFullSlug, docsDefinition, docsInfo } = useDocsContext();
    const { activeTabIndex } = useSidebarContext();
    const { closeMobileSidebar } = useMobileSidebarContext();
    const router = useRouter();

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
                void router.push("/" + getFullSlug(slugToNavigate));
                navigateToPath(slugToNavigate);
                closeMobileSidebar();
            }
        }
    }, [router, navigateToPath, slug, getFullSlug, urlPathResolver, closeMobileSidebar]);

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

    const [ref, setRef] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (ref == null) {
            return;
        }
        const unsubscribe = registerScrolledToPathListener(fullSlug, () => {
            ref.scrollIntoView({
                block: "center",
            });
        });
        return unsubscribe;
    }, [ref, registerScrolledToPathListener, fullSlug]);

    return (
        <button className={classNames(className)} ref={setRef} onClick={handleClick}>
            <SidebarItemLayout title={renderTitle} />
        </button>
    );
};
