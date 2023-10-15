import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef } from "react";
import { NavigateToPathOpts } from "../docs-context/DocsContext";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarItem {
    export interface Props {
        title: JSX.Element | string;
        className?: string;
        slug: string;
        fullSlug: string;
        leftElement?: JSX.Element;
        rightElement?: JSX.Element;
        indent?: boolean;
        shallow?: boolean;
        navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts | undefined) => void;
        registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
        closeMobileSidebar: () => void;
        isSelected: boolean;
    }
}

const UnmemoizedSidebarItem: React.FC<SidebarItem.Props> = ({
    title,
    className,
    slug,
    fullSlug,
    leftElement,
    rightElement,
    indent = false,
    shallow = false,
    navigateToPath,
    registerScrolledToPathListener,
    closeMobileSidebar,
    isSelected,
}) => {
    const handleClick = useCallback(() => {
        navigateToPath(slug);
        closeMobileSidebar();
    }, [navigateToPath, closeMobileSidebar, slug]);

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <div
                    className={classNames("relative w-full", {
                        "pl-[18px] border-l border-border-default-light dark:border-border-default-dark": indent,
                    })}
                >
                    {indent && isSelected && (
                        <div className="bg-border-default-light dark:bg-border-default-dark absolute left-0 top-[50%] h-px w-[12px]" />
                    )}
                    <div
                        className={classNames(
                            "flex flex-1 py-2 px-3 border rounded-lg items-center justify-between select-none min-w-0",
                            {
                                "text-accent-primary border-border-primary bg-tag-primary": isSelected,
                                "border-transparent": !isSelected,
                                "bg-tag-default-light dark:bg-tag-default-dark text-text-primary-light dark:text-text-primary-dark":
                                    !isSelected && isHovering,
                                "t-muted": !isSelected && !isHovering,
                            }
                        )}
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            {leftElement}
                            <Text ellipsize>{title}</Text>
                        </div>
                        {rightElement}
                    </div>
                </div>
            );
        },
        [isSelected, leftElement, rightElement, title, indent]
    );

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return registerScrolledToPathListener(fullSlug, () => {
            ref.current?.scrollIntoView({ block: "nearest" });
        });
    }, [fullSlug, registerScrolledToPathListener]);

    return (
        <div className={classNames(className)} ref={ref}>
            <Link
                href={`/${fullSlug}`}
                onClick={handleClick}
                className="!no-underline"
                shallow={shallow}
                scroll={!shallow}
            >
                <SidebarItemLayout title={renderTitle} isSelected={isSelected} />
            </Link>
        </div>
    );
};

export const SidebarItem = memo(
    UnmemoizedSidebarItem,
    (prev, next) => prev.isSelected === next.isSelected && prev.slug === next.slug && prev.fullSlug === next.fullSlug
);
