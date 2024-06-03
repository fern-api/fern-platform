import { FernNavigation } from "@fern-api/fdr-sdk";
import { FernTooltip, RemoteFontAwesomeIcon } from "@fern-ui/components";
import cn, { clsx } from "clsx";
import { range } from "lodash-es";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
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
    useEffect,
    useRef,
} from "react";
import { ChevronDown } from "react-feather";
import urljoin from "url-join";
import { getRouteNodeWithAnchor } from "../util/anchor";
import { useIsMobileSidebarOpen } from "./atom";

interface SidebarSlugLinkProps {
    icon?: ReactElement | string;
    slug?: FernNavigation.Slug;
    onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
    className?: string;
    linkClassName?: string;
    title?: ReactNode;
    shallow?: boolean;
    selected?: boolean;
    showIndicator?: boolean;
    depth?: number;
    toggleExpand?: () => void;
    expanded?: boolean;
    rightElement?: ReactNode;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
    tooltipContent?: ReactNode;
    hidden?: boolean;
    scrollOnShallow?: boolean;
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

const SidebarLinkInternal = forwardRef<HTMLButtonElement, SidebarLinkProps>((props, ref) => {
    const {
        icon,
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
        tooltipContent,
        target,
        rel,
        hidden,
        scrollOnShallow,
        as = "span",
    } = props;

    if (hidden && !expanded && !selected) {
        return null;
    }

    const renderLink = (child: ReactElement) => {
        const linkClassName = cn(linkClassNameProp, "fern-sidebar-link", { "opacity-50": hidden });

        return href != null ? (
            <Link
                href={href}
                className={linkClassName}
                onClick={(e) => {
                    onClick?.(e);
                    toggleExpand?.();
                    if (shallow && typeof href === "string") {
                        getRouteNodeWithAnchor(href)?.node?.scrollIntoView({ behavior: "auto" });
                    }
                }}
                shallow={shallow}
                scroll={scrollOnShallow || !shallow}
                target={target}
                rel={rel}
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
                ref={ref}
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
                className={cn("size-5 lg:size-icon lg:my-0.5", {
                    "-rotate-90": !expanded,
                    "rotate-0": expanded,
                })}
            />
        </span>
    );

    return (
        <>
            <div
                ref={elementRef}
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
                                    <span className="mr-3 inline-flex items-center text-faded group-data-[state=active]:text-text-default">
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

const SidebarSlugLinkInternal = forwardRef<HTMLButtonElement, PropsWithChildren<SidebarSlugLinkProps>>((props, ref) => {
    const { slug, registerScrolledToPathListener, ...innerProps } = props;
    const elementRef = useRef<HTMLDivElement>(null);
    const isMobileSidebarOpen = useIsMobileSidebarOpen();

    useEffect(() => {
        if (slug == null) {
            return undefined;
        }
        return registerScrolledToPathListener(slug, () => {
            elementRef.current?.scrollIntoView({ block: "center" });
        });
    }, [slug, registerScrolledToPathListener]);

    useEffect(() => {
        if (isMobileSidebarOpen && props.selected) {
            elementRef.current?.scrollIntoView({ block: "center" });
        }
    }, [isMobileSidebarOpen, props.selected]);

    return (
        <SidebarLink
            {...innerProps}
            ref={ref}
            elementRef={elementRef}
            href={slug != null ? urljoin("/", slug) : undefined}
        />
    );
});

SidebarSlugLinkInternal.displayName = "SidebarSlugLink";

export const SidebarSlugLink = memo(SidebarSlugLinkInternal);
