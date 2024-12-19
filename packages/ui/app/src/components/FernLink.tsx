import { OpenNewWindow } from "iconoir-react";
import { atom, useAtomValue } from "jotai";
import Link, { LinkProps } from "next/link";
import { ReactElement, forwardRef, useEffect, useState, type ComponentProps } from "react";
import { format, parse, resolve, type UrlObject } from "url";
import { useMemoOne } from "use-memo-one";
import { SLUG_ATOM, selectHref, useDomain } from "../atoms";

interface FernLinkProps extends ComponentProps<typeof Link> {
    showExternalLinkIcon?: boolean;
}

export const FernLink = forwardRef<HTMLAnchorElement, FernLinkProps>(
    ({ showExternalLinkIcon = false, ...props }, ref): ReactElement => {
        const url = toUrlObject(props.href);
        const isExternalUrl = checkIsExternalUrl(url);

        // if the url is relative, we will need to invoke useRouter to resolve the relative url
        // since useRouter injects the router context, it will cause a re-render any time the route changes.
        // to avoid unnecessary re-renders, we will isolate the useRouter call to a separate component.
        if (!isExternalUrl && checkIsRelativeUrl(url)) {
            return <FernRelativeLink ref={ref} {...props} />;
        }

        if (isExternalUrl) {
            // strip out the next.js specific props
            const { href, replace, scroll, shallow, passHref, prefetch, locale, legacyBehavior, ...rest } = props;
            return <FernExternalLink ref={ref} {...rest} showExternalLinkIcon={showExternalLinkIcon} url={url} />;
        }

        return <Link ref={ref} {...props} />;
    },
);

FernLink.displayName = "FernLink";

const FernRelativeLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>((props, ref) => {
    const href = useAtomValue(
        useMemoOne(
            () => atom((get) => resolveRelativeUrl(selectHref(get, get(SLUG_ATOM)), formatUrlString(props.href))),
            [props.href],
        ),
    );
    return <Link ref={ref} {...props} href={href} />;
});

FernRelativeLink.displayName = "FernRelativeLink";

interface FernExternalLinkProps extends Omit<ComponentProps<"a">, "href"> {
    showExternalLinkIcon: boolean;
    url: UrlObject;
}

const FernExternalLink = forwardRef<HTMLAnchorElement, FernExternalLinkProps>(
    ({ showExternalLinkIcon, url, ...props }, ref) => {
        const domain = useDomain();
        const [host, setHost] = useState<string>(domain);
        useEffect(() => {
            if (typeof window !== "undefined") {
                setHost(window.location.host);
            }
        }, []);

        // if the link is to a different domain, always open in a new tab
        // TODO: if the link is to the same domain, we should check if the page is a fern page, and if so, use the Link component to leverage client-side navigation
        const isSameSite = host === url.host;
        return (
            // eslint-disable-next-line react/jsx-no-target-blank
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
                {!isSameSite && showExternalLinkIcon && <OpenNewWindow className="external-link-icon" />}
            </a>
        );
    },
);

FernExternalLink.displayName = "FernExternalLink";

const LinkWith404Fallback = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
    return <Link ref={ref} {...props} />;
});

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
    if (href.startsWith(".") || !href.startsWith("/") || href.startsWith("#") || href.startsWith("?")) {
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
        url.href.startsWith(".") || url.href.startsWith("#") || url.href.startsWith("?") || !url.href.startsWith("/")
    );
}
