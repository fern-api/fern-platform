import { Url } from "next/dist/shared/lib/router/router";
import {
  HTMLAttributeAnchorTarget,
  HTMLElementType,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  createElement,
  forwardRef,
  memo,
  useRef,
} from "react";

import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { range } from "es-toolkit/math";
import { ChevronDown, Lock } from "lucide-react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";
import { FaIcon, FernTooltip } from "@fern-docs/components";
import { addLeadingSlash } from "@fern-docs/utils";

import { useCloseDismissableSidebar } from "@/state/mobile";
import { useScrollSidebarNodeIntoView } from "@/state/sidebar-scroll";

import { FernLink } from "../components/FernLink";
import { scrollToRoute } from "../util/anchor";

interface SidebarSlugLinkProps {
  nodeId: FernNavigation.NodeId;
  icon?: ReactElement<any> | string;
  slug?: FernNavigation.Slug;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  onClickIndicator?: React.MouseEventHandler<HTMLSpanElement>;
  className?: string;
  linkClassName?: string;
  title?: ReactNode;
  shallow?: boolean;
  scroll?: boolean;
  selected?: boolean;
  showIndicator?: boolean;
  depth?: number;
  expandable?: boolean;
  expanded?: boolean;
  rightElement?: ReactNode;
  tooltipContent?: ReactNode;
  hidden?: boolean;
  authed?: boolean;
  as?: HTMLElementType;
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

const SidebarLinkInternal = forwardRef<HTMLDivElement, SidebarLinkProps>(
  (props, forwardRef) => {
    const {
      icon,
      className,
      linkClassName: linkClassNameProp,
      title,
      onClick,
      onClickIndicator,
      shallow,
      scroll,
      href,
      selected,
      showIndicator,
      depth = 0,
      expandable = false,
      expanded = false,
      rightElement,
      tooltipContent,
      target,
      rel,
      hidden,
      authed,
      as = "span",
    } = props;

    const ref = useRef<HTMLDivElement>(null);
    const closeDismissableSidebar = useCloseDismissableSidebar();

    if (hidden && !expanded && !selected) {
      return null;
    }

    const renderLink = (child: ReactElement<any>) => {
      const linkClassName = cn(linkClassNameProp, "fern-sidebar-link", {
        "opacity-50": hidden,
      });

      return href != null ? (
        <FernLink
          href={href}
          className={linkClassName}
          onClick={composeEventHandlers(onClick, () => {
            closeDismissableSidebar();
          })}
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
          onClick={composeEventHandlers(onClick, () => {
            closeDismissableSidebar();
          })}
        >
          {child}
        </button>
      );
    };

    const withTooltip = (content: ReactNode) => {
      if (authed) {
        return (
          <FernTooltip
            content="You must be logged in to view this page"
            side="right"
          >
            {content}
          </FernTooltip>
        );
      }

      if (tooltipContent == null) {
        return content;
      }

      return (
        <FernTooltip content={tooltipContent} side="right">
          {content}
        </FernTooltip>
      );
    };

    const expandButton = (expandable || expanded) && (
      <span
        className={cn("fern-sidebar-link-expand", {
          "opacity-50 transition-opacity group-hover:opacity-80":
            !showIndicator,
        })}
        data-state={showIndicator ? "active" : "inactive"}
        onClick={onClickIndicator}
      >
        <ChevronDown
          className={cn("size-icon-md lg:size-icon", {
            "-rotate-90": !expanded,
            "rotate-0": expanded,
          })}
        />
      </span>
    );

    return (
      <div
        ref={composeRefs(forwardRef, ref)}
        className={cn("fern-sidebar-link-container", className)}
        data-state={selected ? "active" : "inactive"}
      >
        {withTooltip(
          renderLink(
            <>
              {range(0, depth).map((i) => (
                <div key={i} className="fern-sidebar-link-indent" />
              ))}
              <span className="fern-sidebar-link-content">
                {icon != null && (
                  <span className="fern-sidebar-icon">
                    {typeof icon === "string" ? <FaIcon icon={icon} /> : icon}
                  </span>
                )}
                {createElement(
                  as,
                  { className: "fern-sidebar-link-text" },
                  title
                )}
                {authed ? (
                  <Lock className="text-(color:--grayscale-a9) size-4 self-center" />
                ) : (
                  rightElement
                )}
              </span>
              {expandButton}
            </>
          )
        )}
      </div>
    );
  }
);

SidebarLinkInternal.displayName = "SidebarLink";

export const SidebarLink = memo(SidebarLinkInternal);

export const SidebarSlugLink = forwardRef<
  HTMLDivElement,
  PropsWithChildren<SidebarSlugLinkProps>
>((props, forwardRef) => {
  const { slug, ...innerProps } = props;
  const ref = useRef<HTMLDivElement>(null);
  useScrollSidebarNodeIntoView(ref, props.nodeId);
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
      shallow={innerProps.shallow || innerProps.selected}
      scroll={!innerProps.shallow}
    />
  );
});

SidebarSlugLink.displayName = "SidebarSlugLink";
