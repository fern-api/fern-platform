import classNames from "classnames";
import Link from "next/link";
import { memo, ReactElement, useCallback, useEffect, useRef } from "react";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarItem {
    export interface Props {
        title: ReactElement | string;
        className?: string;
        onClick: () => void;
        fullSlug: string;
        leftElement?: ReactElement;
        rightElement?: ReactElement;
        indent?: boolean;
        shallow?: boolean;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        isSelected: boolean;
    }
}

const UnmemoizedSidebarItem: React.FC<SidebarItem.Props> = ({
    title,
    className,
    fullSlug,
    leftElement,
    rightElement,
    indent = false,
    shallow = false,
    registerScrolledToPathListener,
    onClick,
    isSelected,
}) => {
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
                            "text-sm flex flex-1 py-2 px-3 border rounded-lg items-center justify-between select-none min-w-0 transition-colors",
                            {
                                "text-accent-primary dark:text-accent-primary-dark border-border-primary dark:border-border-primary-dark bg-tag-primary dark:bg-tag-primary-dark":
                                    isSelected,
                                "border-transparent": !isSelected,
                                "bg-tag-default-light dark:bg-tag-default-dark text-text-primary-light dark:text-text-primary-dark":
                                    !isSelected && isHovering,
                                "t-muted": !isSelected && !isHovering,
                            }
                        )}
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            {leftElement}
                            <span className="truncate">{title}</span>
                        </div>
                        {rightElement}
                    </div>
                </div>
            );
        },
        [isSelected, leftElement, rightElement, title, indent]
    );

    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        return registerScrolledToPathListener(fullSlug, () => {
            ref.current?.scrollIntoView({ block: "nearest" });
        });
    }, [fullSlug, registerScrolledToPathListener]);

    return (
        <li className={classNames(className)} ref={ref}>
            <Link href={`/${fullSlug}`} onClick={onClick} className="!no-underline" shallow={shallow} scroll={false}>
                <SidebarItemLayout title={renderTitle} isSelected={isSelected} />
            </Link>
        </li>
    );
};

export const SidebarItem = memo(
    UnmemoizedSidebarItem,
    (prev, next) => prev.isSelected === next.isSelected && prev.fullSlug === next.fullSlug
);
