import { joinUrlSlugs } from "@fern-api/fdr-sdk";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { range } from "lodash-es";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { FC, HTMLAttributeAnchorTarget, memo, PropsWithChildren, ReactNode, useEffect, useRef } from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { useIsMobileSidebarOpen } from "./atom";

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

export const SidebarLink = memo(function SidebarSlugLinkContent(
    props: PropsWithChildren<
        Omit<SidebarSlugLinkProps, "registerScrolledToPathListener" | "slug"> & {
            // Link props
            href?: Url;
            rel?: string | undefined;
            target?: HTMLAttributeAnchorTarget | undefined;

            elementRef?: React.Ref<HTMLLIElement>;
        }
    >,
) {
    const {
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
        elementRef,
    } = props;
    const renderLink = (child: ReactElement) => {
        const linkClassName = classNames(linkClassNameProp, "fern-sidebar-link");

        return href != null ? (
            <Link
                href={href}
                className={classNames(linkClassName, "!text-inherit")}
                onClick={(e) => {
                    onClick?.(e);
                    toggleExpand?.();
                }}
                target={"_blank"}
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
            className="fern-sidebar-link-expand opacity-60 transition-opacity group-hover:opacity-100 lg:group-hover/sidebar:opacity-100"
            data-state={showIndicator ? "active" : "inactive"}
        >
            <ChevronDownIcon
                className={classNames("transition-transform size-5 lg:size-icon", {
                    "-rotate-90": !expanded,
                    "rotate-0": expanded,
                })}
            />
        </span>
    );

    return (
        <li ref={elementRef} className="fern-sidebar-item">
            <div
                className={classNames("fern-sidebar-link-container group", className)}
                data-state={selected ? "active" : "inactive"}
            >
                {renderLink(
                    <>
                        {range(0, depth).map((i) => (
                            <div
                                key={i}
                                className={classNames(
                                    "fern-sidebar-link-indent",
                                    "transition-transform group-hover/sidebar:opacity-100 transition-opacity ease-out",
                                )}
                            />
                        ))}
                        {expandButton}
                        <span className="fern-sidebar-link-content">
                            <span className="fern-sidebar-link-text">{title}</span>
                            {rightElement}
                        </span>
                        {expandButton}
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
    const isMobileSidebarOpen = useIsMobileSidebarOpen();

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

    return <SidebarLink {...props} elementRef={ref} href={slug != null ? `/${slug.join("/")}` : undefined} />;
};
