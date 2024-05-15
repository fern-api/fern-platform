import { ExternalLinkIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { ReactElement, useEffect, useState, type ComponentProps } from "react";
import { format, parse, resolve, type UrlObject } from "url";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useNavigationContext } from "../contexts/navigation-context";

interface FernLinkProps extends ComponentProps<typeof Link> {
    showExternalLinkIcon?: boolean;
}

export function FernLink({ showExternalLinkIcon = false, ...props }: FernLinkProps): ReactElement {
    const url = toUrlObject(props.href);
    const isExternalUrl = checkIsExternalUrl(url);

    // if the url is relative, we will need to invoke useRouter to resolve the relative url
    // since useRouter injects the router context, it will cause a re-render any time the route changes.
    // to avoid unnecessary re-renders, we will isolate the useRouter call to a separate component.
    if (!isExternalUrl && checkIsRelativeUrl(url)) {
        return <FernRelativeLink {...props} />;
    }

    if (isExternalUrl) {
        return <FernExternalLink {...props} showExternalLinkIcon={showExternalLinkIcon} url={url} />;
    }

    return <Link {...props} />;
}

function FernRelativeLink(props: ComponentProps<typeof Link>) {
    const { selectedSlug } = useNavigationContext();
    const href = resolveRelativeUrl(`/${selectedSlug}`, formatUrlString(props.href));
    return <Link {...props} href={href} />;
}

interface FernExternalLinkProps extends Omit<ComponentProps<"a">, "href"> {
    showExternalLinkIcon: boolean;
    url: UrlObject;
}

function FernExternalLink({ showExternalLinkIcon, url, ...props }: FernExternalLinkProps) {
    const { domain } = useDocsContext();
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
            {...props}
            target={isSameSite ? props.target : "_blank"}
            rel={isSameSite && props.target !== "_blank" ? props.rel : "noreferrer"}
            href={formatUrlString(url)}
        >
            {props.children}
            {!isSameSite && showExternalLinkIcon && <ExternalLinkIcon className="external-link-icon" />}
        </a>
    );
}

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
    return typeof url === "string" ? url : format(url);
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

    if (url.href.startsWith("/")) {
        return false;
    }

    return (
        url.href.startsWith(".") || url.href.startsWith("#") || url.href.startsWith("?") || !url.href.startsWith("/")
    );
}
