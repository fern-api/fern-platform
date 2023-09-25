import classNames from "classnames";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef } from "react";
import { NavigateToPathOpts } from "../docs-context/DocsContext";
import { SidebarItemLayout } from "./SidebarItemLayout";
import { SidebarItemTitle } from "./SidebarItemTitle";

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
                <SidebarItemTitle
                    title={title}
                    leftElement={leftElement}
                    rightElement={rightElement}
                    indent={indent}
                    isSelected={isSelected}
                    isHovering={isHovering}
                />
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
                // TODO: Add back
                shallow={false}
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
