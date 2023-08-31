import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsSlugSelected } from "../docs-context/useIsSlugSelected";
import { SidebarItemLayout } from "./SidebarItemLayout";
import { UrlPathResolver } from "./UrlPathResolver";

export declare namespace SidebarSubpackageItem {
    export interface Props {
        title: JSX.Element | string;
        className?: string;
        slug: string;
    }
}

export const SidebarSubpackageItem: React.FC<SidebarSubpackageItem.Props> = ({ title, className, slug }) => {
    const { navigateToPath, registerScrolledToPathListener, getFullSlug, docsDefinition, docsInfo } = useDocsContext();
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
            const [firstNavigatableEndpoint] = resolvedUrlPath.subpackage.endpoints;
            if (firstNavigatableEndpoint != null) {
                const slugToNavigate = joinUrlSlugs(resolvedUrlPath.slug, firstNavigatableEndpoint.urlSlug);
                void router.push("/" + getFullSlug(slugToNavigate));
                navigateToPath(slugToNavigate);
            }
        }
    }, [router, navigateToPath, slug, getFullSlug, urlPathResolver]);

    const fullSlug = getFullSlug(slug);
    const isSelected = useIsSlugSelected(fullSlug);

    const [wasRecentlySelected, setWasRecentlySelected] = useState(isSelected);
    useEffect(() => {
        if (isSelected) {
            setWasRecentlySelected(true);
            return;
        }

        setTimeout(() => {
            setWasRecentlySelected(false);
        }, 0);
    }, [isSelected]);

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <div
                    className={classNames(
                        "flex flex-1 py-2 px-4 rounded-lg items-center justify-between select-none min-w-0",
                        {
                            "text-accent-primary": isSelected || (!isSelected && isHovering),
                            "border-transparent": !isSelected,
                            "t-muted": !isSelected && !isHovering,
                            transition: !isSelected && !wasRecentlySelected,
                        }
                    )}
                >
                    <div className="flex min-w-0 items-center space-x-2">
                        <HiOutlineChevronDown
                            className={classNames("text-sm transition-all", {
                                "-rotate-90": !isSelected,
                                "rotate-0": isSelected,
                            })}
                        />
                        <Text ellipsize>{title}</Text>
                    </div>
                </div>
            );
        },
        [isSelected, title, wasRecentlySelected]
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
        <button className={className} ref={setRef} onClick={handleClick}>
            <SidebarItemLayout title={renderTitle} isSelected={isSelected} />
        </button>
    );
};
