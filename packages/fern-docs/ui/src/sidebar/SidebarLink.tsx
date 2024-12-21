import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernTooltip, RemoteFontAwesomeIcon } from "@fern-docs/components";
import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import cn, { clsx } from "clsx";
import { range } from "es-toolkit/math";
import { Lock, NavArrowDown } from "iconoir-react";
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
  useRef,
} from "react";
import { useCallbackOne } from "use-memo-one";
import {
  IS_READY_ATOM,
  SIDEBAR_SCROLL_CONTAINER_ATOM,
  useAtomEffect,
  useCloseMobileSidebar,
} from "../atoms";
import { FernLink } from "../components/FernLink";
import { useHref } from "../hooks/useHref";
import { scrollToRoute } from "../util/anchor";
import { scrollToCenter } from "../util/scrollToCenter";

interface SidebarSlugLinkProps {
  nodeId: FernNavigation.NodeId;
  icon?: ReactElement | string;
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
    const closeMobileSidebar = useCloseMobileSidebar();

    if (hidden && !expanded && !selected) {
      return null;
    }

    const renderLink = (child: ReactElement) => {
      const linkClassName = cn(linkClassNameProp, "fern-sidebar-link", {
        "opacity-50": hidden,
      });

      return href != null ? (
        <FernLink
          href={href}
          className={linkClassName}
          onClick={composeEventHandlers(onClick, () => {
            closeMobileSidebar();
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
            closeMobileSidebar();
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
        className={clsx("fern-sidebar-link-expand", {
          "opacity-50 transition-opacity group-hover:opacity-80":
            !showIndicator,
        })}
        data-state={showIndicator ? "active" : "inactive"}
        onClick={onClickIndicator}
      >
        <NavArrowDown
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
                    {typeof icon === "string" ? (
                      <RemoteFontAwesomeIcon
                        icon={icon}
                        className="bg-faded group-data-[state=active]:bg-accent"
                      />
                    ) : (
                      icon
                    )}
                  </span>
                )}
                {createElement(
                  as,
                  { className: "fern-sidebar-link-text" },
                  title
                )}
                {authed ? (
                  <Lock className="text-faded size-4 self-center" />
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

  useAtomEffect(
    useCallbackOne(
      (get) => {
        if (props.selected) {
          scrollToCenter(
            get.peek(SIDEBAR_SCROLL_CONTAINER_ATOM),
            ref.current,
            get.peek(IS_READY_ATOM)
          );
        }
      },
      [props.selected]
    )
  );

  const href = useHref(slug);
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
