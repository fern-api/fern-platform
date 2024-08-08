import type { FernNavigation } from "@fern-api/fdr-sdk";
import { FernTooltip, RemoteFontAwesomeIcon } from "@fern-ui/components";
import cn, { clsx } from "clsx";
import { range } from "lodash-es";
import { Url } from "next/dist/shared/lib/router/router";
import {
    HTMLAttributeAnchorTarget,
    JSX,
    JSXElementConstructor,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    createElement,
    forwardRef,
    memo,
    useCallback,
    useImperativeHandle,
    useRef,
} from "react";
import { ChevronDown } from "react-feather";
import { IS_READY_ATOM, SIDEBAR_SCROLL_CONTAINER_ATOM, useAtomEffect, useCloseMobileSidebar } from "../atoms";
import { FernLink } from "../components/FernLink";
import { scrollToRoute } from "../util/anchor";
import { slugToHref } from "../util/slugToHref";
import { scrollToCenter } from "./utils";

interface SidebarSlugLinkProps {
    nodeId: FernNavigation.NodeId;
    icon?: ReactElement | string;
    slug?: FernNavigation.Slug;
    onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
    className?: string;
    linkClassName?: string;
    title?: ReactNode;
    shallow?: boolean;
    scroll?: boolean;
    selected?: boolean;
    showIndicator?: boolean;
    depth?: number;
    toggleExpand?: () => void;
    expanded?: boolean;
    rightElement?: ReactNode;
    tooltipContent?: ReactNode;
    hidden?: boolean;
    as?: keyof JSX.IntrinsicElements | JSXElementConstructor<any>;
}

type SidebarLinkProps = PropsWithChildren<
    Omit<SidebarSlugLinkProps, "registerScrolledToPathListener" | "slug"> & {
        // Link props
        href?: Url;
        rel?: string | undefined;
        target?: HTMLAttributeAnchorTarget | undefined;

        elementRef?: React.Ref<HTMLDivElement>;
    }
>;

const SidebarLinkInternal = forwardRef<HTMLDivElement, SidebarLinkProps>((props, parentRef) => {
    const {
        icon,
        className,
        linkClassName: linkClassNameProp,
        title,
        onClick,
        shallow,
        scroll,
        href,
        selected,
        showIndicator,
        depth = 0,
        toggleExpand,
        expanded = false,
        rightElement,
        children,
        tooltipContent,
        target,
        rel,
        hidden,
        as = "span",
    } = props;

    const ref = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(parentRef, () => ref.current!);

    if (hidden && !expanded && !selected) {
        return null;
    }

    const renderLink = (child: ReactElement) => {
        const linkClassName = cn(linkClassNameProp, "fern-sidebar-link", { "opacity-50": hidden });

        return href != null ? (
            <FernLink
                href={href}
                className={linkClassName}
                onClick={(e) => {
                    onClick?.(e);
                    toggleExpand?.();
                }}
                shallow={shallow}
                target={target}
                rel={rel}
                scroll={scroll}
            >
                {child}
            </FernLink>
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

    const withTooltip = (content: ReactNode) => {
        if (tooltipContent == null) {
            return content;
        }

        return (
            <FernTooltip content={tooltipContent} side="right">
                {content}
            </FernTooltip>
        );
    };

    const expandButton = (toggleExpand != null || expanded) && (
        <span
            className={clsx("fern-sidebar-link-expand", {
                "opacity-50 transition-opacity group-hover:opacity-80": !showIndicator,
            })}
            data-state={showIndicator ? "active" : "inactive"}
        >
            <ChevronDown
                className={cn("size-5 lg:size-icon", {
                    "-rotate-90": !expanded,
                    "rotate-0": expanded,
                })}
            />
        </span>
    );

    return (
        <>
            <div
                ref={ref}
                className={cn("fern-sidebar-link-container group", className)}
                data-state={selected ? "active" : "inactive"}
            >
                {withTooltip(
                    renderLink(
                        <>
                            {range(0, depth).map((i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "fern-sidebar-link-indent",
                                        "group-hover/sidebar:opacity-100 transition-opacity ease-out",
                                    )}
                                />
                            ))}
                            <span className="fern-sidebar-link-content">
                                {icon != null && (
                                    <span className="mr-3 inline-flex items-center text-faded group-data-[state=active]:t-accent-aaa my-0.5">
                                        {typeof icon === "string" ? (
                                            <RemoteFontAwesomeIcon
                                                icon={icon}
                                                className="bg-faded group-data-[state=active]:bg-text-default"
                                            />
                                        ) : (
                                            icon
                                        )}
                                    </span>
                                )}
                                {createElement(as, { className: "fern-sidebar-link-text" }, title)}
                                {rightElement}
                            </span>
                            {expandButton}
                        </>,
                    ),
                )}
            </div>
            {children}
        </>
    );
});

SidebarLinkInternal.displayName = "SidebarLink";

export const SidebarLink = memo(SidebarLinkInternal);

export const SidebarSlugLink = forwardRef<HTMLDivElement, PropsWithChildren<SidebarSlugLinkProps>>(
    (props, parentRef) => {
        const { slug, onClick, ...innerProps } = props;
        const ref = useRef<HTMLDivElement>(null);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        useImperativeHandle(parentRef, () => ref.current!);
        const closeMobileSidebar = useCloseMobileSidebar();

        useAtomEffect(
            useCallback(
                (get) => {
                    if (props.selected) {
                        scrollToCenter(get(SIDEBAR_SCROLL_CONTAINER_ATOM), ref.current, !get(IS_READY_ATOM));
                    }
                },
                [props.selected],
            ),
        );

        const href = slug != null ? slugToHref(slug) : undefined;
        const handleClick = useCallback<React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>>(
            (e) => {
                onClick?.(e);
                if (href != null) {
                    closeMobileSidebar();
                    if (innerProps.shallow) {
                        scrollToRoute(href);
                    }
                }
            },
            [closeMobileSidebar, href, innerProps.shallow, onClick],
        );

        return (
            <SidebarLink
                {...innerProps}
                ref={ref}
                href={href}
                onClick={handleClick}
                shallow={innerProps.shallow || innerProps.selected}
                scroll={!innerProps.shallow}
            />
        );
    },
);

SidebarSlugLink.displayName = "SidebarSlugLink";
