import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { NextRouter, useRouter } from "next/router";
import { memo, ReactElement, useCallback, useEffect, useRef } from "react";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { useNavigationContext } from "../navigation-context";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarSubpackageItem {
    export interface Props {
        title: ReactElement | string;
        isChildSelected: boolean;
        className?: string;
        fullSlug: string;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        docsDefinition: DocsV1Read.DocsDefinition;
        activeTabIndex: number | null;
        closeMobileSidebar: () => void;
        pushRoute: NextRouter["push"];
    }
}

const UnmemoizedSidebarSubpackageItem: React.FC<SidebarSubpackageItem.Props> = ({
    title,
    isChildSelected,
    className,
    fullSlug,
    registerScrolledToPathListener,
}) => {
    const router = useRouter();
    const { navigateToPath } = useNavigationContext();

    const handleClick = useCallback(async () => {
        navigateToPath(fullSlug);
        void router.replace(`/${fullSlug}`, undefined, { shallow: true });
    }, [fullSlug, navigateToPath, router]);

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

                        <span className="truncate">{title}</span>
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
    (prev, next) => prev.isChildSelected === next.isChildSelected && prev.fullSlug === next.fullSlug
);
