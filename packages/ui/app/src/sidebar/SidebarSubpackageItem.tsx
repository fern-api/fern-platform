import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsSlugSelected } from "../docs-context/useIsSlugSelected";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarSubpackageItem {
    export interface Props {
        title: JSX.Element | string;
        className?: string;
        slug: string;
    }
}

export const SidebarSubpackageItem: React.FC<SidebarSubpackageItem.Props> = ({ title, className, slug }) => {
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
        <div className={className} ref={setRef}>
            <Link href={`/${fullSlug}`} onClick={handleClick} className="!no-underline">
                <SidebarItemLayout title={renderTitle} isSelected={isSelected} />
            </Link>
        </div>
    );
};
