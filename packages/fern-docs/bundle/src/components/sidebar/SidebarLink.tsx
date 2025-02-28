import { Url } from "next/dist/shared/lib/router/router";
import {
  HTMLAttributeAnchorTarget,
  PropsWithChildren,
  ReactNode,
  forwardRef,
  useRef,
} from "react";
import React from "react";

import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { ChevronDown, Lock } from "lucide-react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernTooltip, cn } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { useIsSelectedSidebarNode } from "@/state/navigation";
import { useScrollSidebarNodeIntoView } from "@/state/sidebar-scroll";

import { FernLink } from "../components/FernLink";
import { scrollToRoute } from "../util/anchor";

interface SidebarSlugLinkProps {
  nodeId: FernNavigation.NodeId;
  icon?: React.ReactNode;
  slug?: FernNavigation.Slug;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onToggleExpand?: (e: React.MouseEvent<HTMLElement | SVGSVGElement>) => void;
  className?: string;
  title?: ReactNode;
  shallow?: boolean;
  scroll?: boolean;
  selected?: boolean;
  showIndicator?: boolean;
  depth?: number;
  expanded?: boolean;
  rightElement?: ReactNode;
  tooltipContent?: ReactNode;
  hidden?: boolean;
  authed?: boolean;
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

const SidebarLinkInternal = React.forwardRef<
  HTMLAnchorElement,
  SidebarLinkProps
>((props, forwardRef) => {
  const {
    icon,
    className,
    title,
    onToggleExpand,
    onClick,
    shallow,
    scroll,
    href,
    selected,
    showIndicator,
    depth = 0,
    expanded = false,
    rightElement,
    tooltipContent,
    target,
    rel,
    hidden,
    authed,
  } = props;

  const expandButton = (!!onToggleExpand || expanded) && (
    <ChevronDown
      className={cn(
        "data-[state=active]:text-(color:--accent-a11) data-[state=active]:bg-(color:--accent-a3) data-[state=active]:rounded-1 ml-auto cursor-default transition-transform",
        expanded ? "rotate-0" : "-rotate-90"
      )}
      data-state={showIndicator ? "active" : "inactive"}
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleExpand?.(e);
      }}
    />
  );

  const withTooltip = (children: ReactNode) => {
    let content = tooltipContent;
    if (authed) {
      content = "You must be logged in to view this page";
    }

    if (content == null) {
      return children;
    }

    return <FernTooltip content={content} side="right"></FernTooltip>;
  };

  const sharedClassName = cn(
    "text-(color:--grayscale-a11) lg:rounded-2 group flex w-full items-center gap-3 px-4 py-2 text-left text-base leading-tight lg:p-2 lg:text-sm",
    "[&_svg]:size-icon-md lg:[&_svg]:size-icon [&_svg]:text-(color:--grayscale-a9) [&_svg]:shrink-0",
    "hover:text-(color:--grayscale-a12) hover:bg-(color:--grayscale-a3) transition-colors hover:transition-none",
    "data-[state=active]:text-(color:--accent-a11) data-[state=active]:bg-(color:--accent-a3) data-[state=active]:[&_svg]:text-(color:--accent-a9) data-[state=active]:font-medium",
    { "opacity-50": hidden },
    depth > 0 &&
      "data-[state=active]:max-lg:border-(color:--accent-a6) max-lg:pl-2 data-[state=active]:max-lg:-ml-px data-[state=active]:max-lg:border-l lg:py-1.5",
    className
  );

  return withTooltip(
    href ? (
      <FernLink
        ref={forwardRef}
        href={href}
        scroll={scroll}
        shallow={shallow}
        target={target}
        rel={rel}
        className={sharedClassName}
        onClick={(e) => {
          onClick?.(e);

          if (e.isDefaultPrevented()) {
            return;
          }

          // if the link is not selected AND is expanded, we do NOT want to close it.
          if (selected || !expanded) {
            onToggleExpand?.(e);
          }
        }}
        data-state={selected ? "active" : "inactive"}
      >
        {icon}
        {title}
        {authed ? <Lock /> : rightElement}
        {expandButton}
      </FernLink>
    ) : (
      <button
        ref={forwardRef as React.ForwardedRef<HTMLButtonElement>}
        className={sharedClassName}
        onClick={(e) => {
          onClick?.(e);

          if (e.isDefaultPrevented()) {
            return;
          }

          onToggleExpand?.(e);
        }}
        data-state={selected ? "active" : "inactive"}
      >
        {icon}
        {title}
        {authed ? <Lock /> : rightElement}
        {expandButton}
      </button>
    )
  );
});

SidebarLinkInternal.displayName = "SidebarLink";

export const SidebarLink = React.memo(SidebarLinkInternal);

export const SidebarSlugLink = forwardRef<
  HTMLAnchorElement,
  PropsWithChildren<Omit<SidebarSlugLinkProps, "selected">>
>((props, forwardRef) => {
  const { slug, ...innerProps } = props;
  const ref = useRef<HTMLAnchorElement>(null);
  useScrollSidebarNodeIntoView(ref, props.nodeId);
  const selected = useIsSelectedSidebarNode(props.nodeId);
  const href = slug ? addLeadingSlash(slug) : undefined;
  return (
    <SidebarLink
      {...innerProps}
      ref={composeRefs(forwardRef, ref)}
      href={href}
      onClick={composeEventHandlers(innerProps.onClick, () => {
        if (href) {
          scrollToRoute(href);
        }
      })}
      shallow={innerProps.shallow || selected}
      scroll={!innerProps.shallow}
      selected={selected}
    />
  );
});

SidebarSlugLink.displayName = "SidebarSlugLink";
