"use client";

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
import { slugToHref } from "@fern-docs/utils";

import { FernLink } from "@/components/FernLink";
import { useIsSelectedSidebarNode } from "@/state/navigation";
import { useScrollSidebarNodeIntoView } from "@/state/sidebar-scroll";

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
    href?: string;
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
    // scroll,
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
      className={cn("expand-indicator", expanded ? "rotate-0" : "-rotate-90")}
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

    return (
      <FernTooltip content={content} side="right">
        {children}
      </FernTooltip>
    );
  };

  const sharedClassName = cn(
    "fern-sidebar-link",
    { "opacity-50": hidden },
    depth > 0 && "nested",
    className
  );

  return withTooltip(
    href ? (
      <FernLink
        ref={forwardRef}
        href={href}
        scroll={true}
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
        <span className="mr-auto w-full hyphens-auto break-words">{title}</span>
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
        <span className="mr-auto">{title}</span>
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
  const href = slug ? slugToHref(slug) : undefined;
  return (
    <SidebarLink
      {...innerProps}
      ref={composeRefs(forwardRef, ref)}
      href={href}
      onClick={composeEventHandlers(innerProps.onClick, () => {
        // if (href) {
        //   scrollToRoute(href);
        // }
      })}
      shallow={innerProps.shallow || selected}
      scroll={!innerProps.shallow}
      selected={selected}
    />
  );
});

SidebarSlugLink.displayName = "SidebarSlugLink";
