import { OpenNewWindow } from "iconoir-react";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { ReactElement, forwardRef, type ComponentProps } from "react";
import { useDomain } from "../atoms";

interface FernLinkProps extends ComponentProps<typeof Link> {
    showExternalLinkIcon?: boolean;
}

export const FernLink = forwardRef<HTMLAnchorElement, FernLinkProps>(
    ({ showExternalLinkIcon = false, ...props }, ref): ReactElement => {
        const host = getHost(props.href);

        // // if the url is relative, we will need to invoke useRouter to resolve the relative url
        // // since useRouter injects the router context, it will cause a re-render any time the route changes.
        // // to avoid unnecessary re-renders, we will isolate the useRouter call to a separate component.
        // if (!isExternalUrl && checkIsRelativeUrl(props.href)) {
        //     return <FernRelativeLink ref={ref} {...props} />;
        // }

        if (host != null) {
            // strip out the next.js specific props
            const { href, replace, scroll, shallow, passHref, prefetch, locale, legacyBehavior, ...rest } = props;
            return <FernExternalLink ref={ref} {...rest} showExternalLinkIcon={showExternalLinkIcon} host={host} />;
        }

        return <Link ref={ref} {...props} />;
    },
);

FernLink.displayName = "FernLink";

// const FernRelativeLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>((props, ref) => {
//     const href = useAtomValue(
//         useMemoOne(
//             () => atom((get) => resolveRelativeUrl(selectHref(get, get(SLUG_ATOM)), formatUrlString(props.href))),
//             [props.href],
//         ),
//     );
//     return <Link ref={ref} {...props} href={href} />;
// });

// FernRelativeLink.displayName = "FernRelativeLink";

interface FernExternalLinkProps extends ComponentProps<"a"> {
    showExternalLinkIcon: boolean;
    host: string;
}

const FernExternalLink = forwardRef<HTMLAnchorElement, FernExternalLinkProps>(
    ({ showExternalLinkIcon, href, host, ...props }, ref) => {
        const domain = useDomain();

        // if the link is to a different domain, always open in a new tab
        // TODO: if the link is to the same domain, we should check if the page is a fern page, and if so, use the Link component to leverage client-side navigation
        const isSameSite = domain === host;
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
                href={href}
            >
                {props.children}
                {!isSameSite && showExternalLinkIcon && <OpenNewWindow className="external-link-icon" />}
            </a>
        );
    },
);

FernExternalLink.displayName = "FernExternalLink";

// export function resolveRelativeUrl(pathName: string, href: string): string {
//     // if the href is "../" or "./" or missing an initial slash, we want to resolve it relative to the current page
//     if (href.startsWith(".") || !href.startsWith("/") || href.startsWith("#") || href.startsWith("?")) {
//         const pathname = resolve(pathName, href);
//         return pathname;
//     }
//     return href;
// }

export function getHost(href: Url): string | undefined {
    const host = typeof href === "string" ? new URL(href, "http://n").host : href.host;
    return host != null && host !== "n" ? host : undefined;
}

export function checkIsRelativeUrl(href: string): boolean {
    if (href.startsWith("/")) {
        return false;
    }
    return href.trim() === "" || href.startsWith(".") || href.startsWith("#") || href.startsWith("?");
}
