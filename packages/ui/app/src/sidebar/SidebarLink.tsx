import classNames from "classnames";
import { range } from "lodash-es";
import Link from "next/link";
import { FC, memo, PropsWithChildren, ReactNode, useEffect, useRef } from "react";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";

interface SidebarLinkProps {
    className?: string;
    title?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    shallow?: boolean;
    slug: string;
    selected?: boolean;
    showIndicator?: boolean;
    depth: number;
    toggleExpand?: () => void;
    expanded?: boolean;
    rightElement?: ReactNode;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
}

const UnmemoizedSidebarLink: FC<PropsWithChildren<SidebarLinkProps>> = ({
    className,
    title,
    onClick,
    shallow,
    slug,
    selected,
    showIndicator,
    depth,
    toggleExpand,
    expanded = false,
    rightElement,
    registerScrolledToPathListener,
    children,
}) => {
    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        return registerScrolledToPathListener(slug, () => {
            ref.current?.scrollIntoView({ block: "center" });
        });
    }, [slug, registerScrolledToPathListener]);

    return (
        <li ref={ref}>
            <div
                className={classNames(className, "items-stretch relative flex min-h-[44px] md:min-h-[36px]", {
                    "hover:text-accent-primary hover:dark:text-accent-primary-dark t-muted": !selected,
                    "text-accent-primary dark:text-accent-primary-dark": selected,
                })}
            >
                {range(0, depth).map((i) => (
                    <div
                        key={i}
                        className={classNames(
                            "relative flex-0 w-[22px] md:w-3 shrink-0 border-r",
                            "transition-transform group-hover/sidebar:translate-x-0 md:translate-x-0.5 group-hover/sidebar:opacity-100 transition-opacity",
                            {
                                "border-accent-primary/60 dark:border-accent-primary-dark/60":
                                    selected && i === depth - 1,
                                "border-border-default-light dark:border-border-default-dark md:opacity-60":
                                    !selected || i < depth - 1,
                            }
                        )}
                    />
                ))}
                {(toggleExpand != null || expanded) && (
                    <button
                        className={classNames(
                            "flex w-[44px] md:w-6 justify-center items-center transition-colors rounded-none md:rounded-lg",
                            {
                                "md:hover:bg-tag-primary/10 md:hover:dark:bg-tag-primary-dark/10 md:opacity-60 group-hover/sidebar:opacity-100 transition-opacity":
                                    toggleExpand != null,
                                "md:rounded-l-none": depth > 0,
                                "md:bg-tag-primary md:dark:bg-tag-primary-dark relative md:after:content-none after:content-[''] after:absolute after:inset-1 after:rounded-lg after:bg-tag-primary after:dark:bg-tag-primary-dark text-accent-primary dark:text-accent-primary-dark md:text-inherit after:pointer-events-none":
                                    showIndicator,
                            }
                        )}
                        onClick={toggleExpand}
                    >
                        <ChevronDownIcon
                            className={classNames(
                                "h-6 w-6 md:h-5 w-5 transition-transform md:translate-x-0.5 group-hover/sidebar:translate-x-0",
                                {
                                    "-rotate-90": !expanded,
                                    "rotate-0": expanded,
                                }
                            )}
                        />
                    </button>
                )}
                <Link
                    href={`/${slug}`}
                    className={classNames(
                        "text-inherit hover:text-inherit relative inline-flex flex-1 content-between items-center px-4 md:px-3 no-underline hover:no-underline py-3 md:py-2 rounded-lg ring-border-primary dark:ring-border-primary-dark",
                        {
                            "font-semibold bg-tag-primary dark:bg-tag-primary-dark ring-1 md:ring-0": selected,
                            "md:hover:bg-tag-primary/10 md:hover:dark:bg-tag-primary-dark/10 ring-0": !selected,
                        },
                        {
                            "ml-[38px] md:ml-6": toggleExpand == null && !expanded && depth > 0,
                        }
                    )}
                    onClick={onClick}
                    shallow={shallow}
                >
                    <span className="flex-1 text-base leading-5 md:text-sm md:leading-4">{title}</span>
                    {rightElement}
                </Link>
            </div>
            {children}
        </li>
    );
};

export const SidebarLink = memo(UnmemoizedSidebarLink);
