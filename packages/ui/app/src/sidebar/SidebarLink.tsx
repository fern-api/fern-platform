import { joinUrlSlugs } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { range } from "lodash-es";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { FC, HTMLAttributeAnchorTarget, memo, PropsWithChildren, ReactNode, useEffect, useRef } from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";

interface SidebarSlugLinkProps {
    slug?: string[];
    onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
    className?: string;
    linkClassName?: string;
    title?: string;
    shallow?: boolean;
    selected?: boolean;
    showIndicator?: boolean;
    depth?: number;
    toggleExpand?: () => void;
    expanded?: boolean;
    rightElement?: ReactNode;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
}

export const SidebarLink = memo(function SidebarSlugLinkContent({
    className,
    linkClassName: linkClassNameProp,
    title,
    onClick,
    shallow,
    href,
    selected,
    showIndicator,
    depth = 0,
    toggleExpand,
    expanded = false,
    rightElement,
    children,
    closeMobileSidebar,
    elementRef,
}: PropsWithChildren<
    Omit<SidebarSlugLinkProps, "registerScrolledToPathListener" | "slug"> & {
        // Link props
        href?: Url;
        rel?: string | undefined;
        target?: HTMLAttributeAnchorTarget | undefined;

        // SidebarSlugLink props
        closeMobileSidebar?: () => void;
        elementRef?: React.Ref<HTMLLIElement>;
    }
>) {
    const renderLink = (child: ReactElement) => {
        const linkClassName = classNames(
            linkClassNameProp,
            "!text-inherit text-left !hover:text-inherit relative inline-flex flex-1 content-between items-stretch px-4 lg:px-3 no-underline hover:no-underline rounded-lg ring-border-primary dark:ring-border-primary-dark ring-inset",
            {
                "bg-tag-primary dark:bg-tag-primary-dark ring-1 lg:ring-0": selected,
                "lg:hover:bg-tag-default-light/5/10 lg:dark:hover:bg-tag-default-dark/5 ring-0": !selected,
            },
            {
                "!pl-0": toggleExpand != null || expanded || depth > 0,
            },
        );

        return href != null ? (
            <Link
                href={href}
                className={linkClassName}
                onClick={(e) => {
                    closeMobileSidebar?.();
                    onClick?.(e);
                    toggleExpand?.();
                }}
                shallow={shallow}
            >
                {child}
            </Link>
        ) : (
            <button
                className={linkClassName}
                onClick={(e) => {
                    onClick?.(e);
                    toggleExpand?.();
                }}
            >
                {child}
            </button>
        );
    };

    const expandButton = (toggleExpand != null || expanded) && (
        <span
            className={classNames(
                "relative",
                "flex w-[44px] lg:w-6 justify-center items-center transition-colors rounded-none transition-transform lg:translate-x-1 group-hover/sidebar:translate-x-0 ease-out",
                {
                    "lg:opacity-60 group-hover/sidebar:opacity-100 transition-opacity": toggleExpand != null,
                    "lg:bg-tag-primary lg:dark:bg-tag-primary-dark lg:after:content-none after:content-[''] after:absolute after:inset-1 after:rounded-lg after:bg-tag-primary after:dark:bg-tag-primary-dark text-accent-primary !lg:text-inherit after:pointer-events-none":
                        showIndicator,
                    "lg:hover:bg-tag-default-light/5 lg:dark:hover:bg-tag-default-dark/5":
                        !showIndicator && toggleExpand != null,
                    "lg:rounded-lg dark:group-hover:rounded-r-none": depth === 0,
                    "lg:rounded-r-lg dark:group-hover:rounded-r-none": depth > 0,
                },
            )}
        >
            <ChevronDownIcon
                className={classNames("h-6 w-6 lg:h-5 w-5 transition-transform", {
                    "-rotate-90": !expanded,
                    "rotate-0": expanded,
                })}
            />
        </span>
    );

    const titleSpanClassName = classNames("flex-1 text-base leading-6 lg:text-sm lg:leading-5", {
        "ml-[12px]": toggleExpand != null || expanded,
        "ml-[36px]": depth > 0 && toggleExpand == null && !expanded,
    });

    return (
        <li ref={elementRef} className="scroll-my-32">
            <div
                className={classNames(className, "group items-stretch relative flex min-h-[44px] lg:min-h-[36px]", {
                    "hover:text-accent-primary t-muted": !selected,
                    "text-accent-primary": selected,
                })}
            >
                {renderLink(
                    <>
                        {range(0, depth).map((i) => (
                            <div
                                key={i}
                                className={classNames(
                                    "relative flex-0 w-[22px] lg:w-3 shrink-0 border-r",
                                    "transition-transform group-hover/sidebar:translate-x-0 lg:translate-x-1 group-hover/sidebar:opacity-100 transition-opacity ease-out",
                                    {
                                        "border-accent-primary/60": selected,
                                        "border-border-default-light dark:border-border-default-dark lg:opacity-60":
                                            !selected,
                                    },
                                )}
                            />
                        ))}
                        {expandButton}
                        <span className="inline-flex flex-1 items-center py-3 lg:py-2">
                            <span className={titleSpanClassName}>{title}</span>
                            {rightElement}
                        </span>
                    </>,
                )}
            </div>
            {children}
        </li>
    );
});

export const SidebarSlugLink: FC<PropsWithChildren<SidebarSlugLinkProps>> = ({
    slug,
    registerScrolledToPathListener,
    ...props
}) => {
    const ref = useRef<HTMLLIElement>(null);
    const { closeMobileSidebar, isMobileSidebarOpen } = useMobileSidebarContext();

    useEffect(() => {
        if (slug == null) {
            return undefined;
        }
        return registerScrolledToPathListener(joinUrlSlugs(...slug), () => {
            ref.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
        });
    }, [slug, registerScrolledToPathListener]);

    useEffect(() => {
        if (isMobileSidebarOpen && props.selected) {
            ref.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    }, [isMobileSidebarOpen, props.selected]);

    return (
        <SidebarLink
            {...props}
            elementRef={ref}
            closeMobileSidebar={closeMobileSidebar}
            href={slug != null ? `/${slug.join("/")}` : undefined}
        />
    );
};
