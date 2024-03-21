import { ExternalLinkIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import path from "path";
import { type ComponentProps } from "react";
import { format, parse, type UrlObject } from "url";

interface FernLinkProps extends ComponentProps<typeof Link> {
    showExternalLinkIcon?: boolean;
}

export function FernLink(props: FernLinkProps) {
    const urlObject = toUrlObject(props.href);

    if (checkIsRelativeUrl(urlObject)) {
        return <FernRelativeLink {...props} />;
    }

    const isExternalUrl = checkIsExternalUrl(urlObject);

    return (
        <Link {...props} target={isExternalUrl ? "_blank" : props.target}>
            {props.children}
            {isExternalUrl && props.showExternalLinkIcon && <ExternalLinkIcon />}
        </Link>
    );
}

function FernRelativeLink(props: ComponentProps<typeof Link>) {
    const router = useRouter();
    const href = resolveRelativeUrl(router.asPath, formatUrlString(props.href));
    return <Link {...props} href={href} />;
}

export function toUrlObject(url: string | UrlObject) {
    return typeof url === "string" ? parse(url) : url;
}

export function formatUrlString(url: string | UrlObject) {
    return typeof url === "string" ? url : format(url);
}

export function resolveRelativeUrl(pathName: string, href: string): string {
    // if the href is "../" or "./" or missing an initial slash, we want to resolve it relative to the current page
    if (href.startsWith(".") || !href.startsWith("/")) {
        const pathname = path.resolve(parse(pathName).pathname ?? "", href);

        return pathname;
    }
    return href;
}

export function checkIsExternalUrl(url: UrlObject) {
    return url.protocol != null && url.host != null;
}

export function checkIsRelativeUrl(url: UrlObject) {
    return url.protocol == null && url.host == null && url.pathname != null && !url.pathname.startsWith("/");
}
