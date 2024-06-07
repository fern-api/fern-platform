import { FernNavigation } from "@fern-api/fdr-sdk";
import { FernTooltip, RemoteFontAwesomeIcon } from "@fern-ui/components";
import { TriangleDownIcon } from "@radix-ui/react-icons";
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
    RefObject,
    createElement,
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";
import urljoin from "url-join";
import { getRouteNodeWithAnchor } from "../util/anchor";
import { useCloseMobileSidebar, useIsMobileSidebarOpen } from "./atom";

interface SidebarSlugLinkProps {
    nodeId: FernNavigation.NodeId;
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
    registerScrolledToPathListener: (nodeId: FernNavigation.NodeId, ref: RefObject<HTMLDivElement>) => () => void;
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

const SidebarLinkInternal = forwardRef<HTMLDivElement, SidebarLinkProps>((props, parentRef) => {
    const {
        icon,
        className,
        linkClassName: linkClassNameProp,
        title,
        onClick,
        shallow,
        href,
        selected,
        // showIndicator,
        depth = 0,
        toggleExpand,
        expanded = false,
        rightElement,
        children,
        tooltipContent,
        target,
        rel,
        hidden,
        scrollOnShallow,
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
        <span className={clsx("fern-sidebar-link-expand")}>
            <TriangleDownIcon
                className={cn("size-3 scale-x-125", {
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
                                <span key={i} className="fern-sidebar-link-indent" />
                            ))}
                            {expandButton}
                            <span className="fern-sidebar-link-content">
                                {icon != null && (
                                    <span className="mr-3">
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
        const { slug, registerScrolledToPathListener, onClick, ...innerProps } = props;
        const ref = useRef<HTMLDivElement>(null);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        useImperativeHandle(parentRef, () => ref.current!);
        const isMobileSidebarOpen = useIsMobileSidebarOpen();
        const closeMobileSidebar = useCloseMobileSidebar();

        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(() => registerScrolledToPathListener(props.nodeId, ref), [props.nodeId]);

        useEffect(() => {
            if (isMobileSidebarOpen && props.selected) {
                ref.current?.scrollIntoView({ block: "center" });
            }
        }, [isMobileSidebarOpen, props.selected]);
        const handleClick = useCallback<React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>>(
            (e) => {
                onClick?.(e);
                if (slug != null) {
                    closeMobileSidebar();
                }
            },
            [closeMobileSidebar, onClick, slug],
        );

        return (
            <SidebarLink
                {...innerProps}
                ref={ref}
                href={slug != null ? urljoin("/", slug) : undefined}
                onClick={handleClick}
            />
        );
    },
);

SidebarSlugLink.displayName = "SidebarSlugLink";
