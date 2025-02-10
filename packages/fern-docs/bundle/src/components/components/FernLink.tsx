"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { OpenNewWindow } from "iconoir-react";
import { type UrlObject, format, parse, resolve } from "url";

import { useDomain } from "../atoms";

export const FernLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof Link> & {
    showExternalLinkIcon?: boolean;
  }
>(function FernLink({ showExternalLinkIcon = false, ...props }, ref) {
  const url = toUrlObject(props.href);
  const isExternalUrl = checkIsExternalUrl(url);

  // if the url is relative, we will need to invoke useRouter to resolve the relative url
  // since useRouter injects the router context, it will cause a re-render any time the route changes.
  // to avoid unnecessary re-renders, we will isolate the useRouter call to a separate component.
  if (!isExternalUrl && checkIsRelativeUrl(url)) {
    return <FernRelativeLink ref={ref} {...props} />;
  }

  if (isExternalUrl) {
    return (
      <FernExternalLink
        ref={ref}
        {...stripNextLinkProps(props)}
        showExternalLinkIcon={showExternalLinkIcon}
        url={url}
      />
    );
  }

  return <Link ref={ref} {...props} />;
});

FernLink.displayName = "FernLink";

const FernRelativeLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof Link>
>((props, ref) => {
  const pathname = usePathname();
  const href = resolveRelativeUrl(pathname, formatUrlString(props.href));
  return <Link ref={ref} {...props} href={href} />;
});

FernRelativeLink.displayName = "FernRelativeLink";

interface FernExternalLinkProps
  extends Omit<React.ComponentProps<"a">, "href"> {
  showExternalLinkIcon: boolean;
  url: UrlObject;
}

const FernExternalLink = React.forwardRef<
  HTMLAnchorElement,
  FernExternalLinkProps
>(({ showExternalLinkIcon, url, ...props }, ref) => {
  const domain = useDomain();
  const [host, setHost] = React.useState<string>(domain);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.host);
    }
  }, []);

  // if the link is to a different domain, always open in a new tab
  // TODO: if the link is to the same domain, we should check if the page is a fern page, and if so, use the Link component to leverage client-side navigation
  const isSameSite = host === url.host;
  return (
    <a
      ref={ref}
      {...props}
      target={isSameSite || props.target != null ? props.target : "_blank"}
      rel={
        isSameSite && props.target !== "_blank"
          ? props.rel
          : props.rel == null
            ? "noreferrer"
            : props.rel.includes("noreferrer")
              ? props.rel
              : `${props.rel} noreferrer`
      }
      href={formatUrlString(url)}
    >
      {props.children}
      {!isSameSite && showExternalLinkIcon && (
        <OpenNewWindow className="external-link-icon" />
      )}
    </a>
  );
});

FernExternalLink.displayName = "FernExternalLink";

const LinkWith404Fallback = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    return <Link ref={ref} {...props} />;
  }
);

LinkWith404Fallback.displayName = "LinkWith404Fallback";

export function toUrlObject(url: string | UrlObject): UrlObject {
  if (url == null) {
    return {};
  }
  return typeof url === "string" ? parse(url) : url;
}

export function formatUrlString(url: string | UrlObject): string {
  if (url == null) {
    return "";
  }
  if (typeof url === "object") {
    return format(url);
  }
  return typeof url === "string" ? url : "";
}

export function resolveRelativeUrl(pathName: string, href: string): string {
  // if the href is "../" or "./" or missing an initial slash, we want to resolve it relative to the current page
  if (
    href.startsWith(".") ||
    !href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("?")
  ) {
    const pathname = resolve(pathName, href);
    return pathname;
  }
  return href;
}

export function checkIsExternalUrl(url: UrlObject): boolean {
  return url.protocol != null && url.host != null;
}

export function checkIsRelativeUrl(url: UrlObject): boolean {
  if (url.href == null) {
    return true;
  }

  if (url.protocol) {
    return false;
  }

  if (url.href.startsWith("/")) {
    return false;
  }

  return (
    url.href.startsWith(".") ||
    url.href.startsWith("#") ||
    url.href.startsWith("?") ||
    !url.href.startsWith("/")
  );
}

type MaybeFernLinkProps = Omit<
  React.ComponentPropsWithoutRef<typeof FernLink>,
  "href"
> & {
  href?: React.ComponentPropsWithoutRef<typeof FernLink>["href"];
};

export const MaybeFernLink = React.forwardRef<
  HTMLAnchorElement,
  MaybeFernLinkProps
>(function MaybeFernLink({ href, ...props }, ref) {
  if (href == null) {
    return <span ref={ref} {...stripNextLinkProps(props)} />;
  }
  return <FernLink ref={ref} {...props} href={href} />;
});

function stripNextLinkProps<T extends MaybeFernLinkProps>(
  props: T
): Omit<
  T,
  | "href"
  | "locale"
  | "legacyBehavior"
  | "prefetch"
  | "replace"
  | "scroll"
  | "shallow"
  | "passHref"
> {
  const {
    href,
    locale,
    legacyBehavior,
    prefetch,
    replace,
    scroll,
    shallow,
    passHref,
    ...rest
  } = props;
  return rest;
}
