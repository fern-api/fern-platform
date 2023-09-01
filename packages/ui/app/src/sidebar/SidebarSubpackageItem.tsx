import { Text } from "@blueprintjs/core";
import { UrlPathResolver } from "@fern-ui/app-utils";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
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
    const { closeMobileSidebar } = useMobileSidebarContext();
    const router = useRouter();

    const urlPathResolver = useMemo(() => {
        return new UrlPathResolver({
            navigation: docsInfo.activeNavigationConfig,
            loadApiDefinition: (id) => docsDefinition.apis[id],
            loadApiPage: (id) => docsDefinition.pages[id],
        });
    }, [docsDefinition, docsInfo]);

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
                        "flex flex-1 py-2 px-3 rounded-lg items-center justify-between select-none min-w-0 border",
                        {
                            "bg-tag-default-light dark:bg-tag-default-dark border-border-default-light dark:border-border-default-dark text-text-primary-light dark:text-text-primary-dark":
                                isHovering,
                            "t-muted border-transparent": !isHovering,
                        }
                    )}
                >
                    <div className="flex min-w-0 items-center space-x-2">
                        <ChevronDownIcon
                            className={classNames("text-sm h-5 w-5 -ml-[6px] min-w-fit transition-transform", {
                                "-rotate-90": !isChildSelected,
                                "rotate-0": isChildSelected,
                            })}
                        />
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
