import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsSlugSelected } from "../docs-context/useIsSlugSelected";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarItem {
    export interface Props {
        title: JSX.Element | string;
        className?: string;
        slug: string;
        leftElement?: JSX.Element;
        rightElement?: JSX.Element;
        paddingLeftAdditional?: number;
    }
}

export const SidebarItem: React.FC<SidebarItem.Props> = ({
    title,
    className,
    slug,
    leftElement,
    rightElement,
    paddingLeftAdditional,
}) => {
    const { navigateToPath, registerScrolledToPathListener, getFullSlug } = useDocsContext();
    const handleClick = useCallback(() => {
        navigateToPath(slug);
    }, [navigateToPath, slug]);

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
                        "flex flex-1 py-2 px-3 border rounded-lg items-center justify-between select-none min-w-0",
                        {
                            "text-accent-primary border-border-primary bg-tag-primary": isSelected,
                            "border-transparent": !isSelected,
                            "text-accent-primary": !isSelected && isHovering,
                            "t-muted": !isSelected && !isHovering,
                            transition: !isSelected && !wasRecentlySelected,
                        }
                    )}
                >
                    <div className="flex min-w-0 items-center gap-2">
                        {leftElement}
                        <Text ellipsize>{title}</Text>
                    </div>
                    {rightElement}
                </div>
            );
        },
        [isSelected, leftElement, rightElement, title, wasRecentlySelected]
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
        <div className={classNames(className)} ref={setRef}>
            <Link href={`/${fullSlug}`} onClick={handleClick} className="!no-underline">
                <SidebarItemLayout
                    title={renderTitle}
                    isSelected={isSelected}
                    paddingLeftAdditional={paddingLeftAdditional}
                />
            </Link>
        </div>
    );
};
