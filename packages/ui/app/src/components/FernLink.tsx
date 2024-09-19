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

        if (host != null) {
            // strip out the next.js specific props
            const { href, replace, scroll, shallow, passHref, prefetch, locale, legacyBehavior, ...rest } = props;
            return <FernExternalLink ref={ref} {...rest} showExternalLinkIcon={showExternalLinkIcon} host={host} />;
        }

        return <Link ref={ref} {...props} />;
    },
);

FernLink.displayName = "FernLink";

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

export function getHost(href: Url): string | undefined {
    const host = typeof href === "string" ? new URL(href, "http://n").host : href.host;
    return host != null && host !== "n" ? host : undefined;
}
