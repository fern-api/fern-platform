import { useMounted } from "@fern-ui/react-commons";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import Link from "next/link";
import React, { AnchorHTMLAttributes, DetailedHTMLProps, HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";
import Zoom from "react-medium-image-zoom";
import { AbsolutelyPositionedAnchor } from "../commons/AbsolutelyPositionedAnchor";
import { FernCard } from "../components/FernCard";
import { useAnchorInView } from "../custom-docs-page/TableOfContentsContext";
import { useNavigationContext } from "../navigation-context";
import { onlyText } from "../util/onlyText";
import "./base-components.scss";

export const InlineCode: React.FC<HTMLAttributes<HTMLElement>> = ({ className, ...rest }) => {
    return (
        <code
            {...rest}
            className={classNames(
                className,
                "not-prose inline-code font-mono border border-concealed rounded bg-background-light/75 dark:bg-background-dark/75 py-0.5 px-1",
            )}
        />
    );
};

export const Table: React.FC<HTMLAttributes<HTMLTableElement>> = ({ className, ...rest }) => {
    return (
        <FernCard className="fern-table not-prose">
            <table {...rest} className={classNames(className)} />
        </FernCard>
    );
};

export const Thead: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...rest }) => {
    return <thead {...rest} className={classNames(className)} />;
};

export const Tbody: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...rest }) => {
    return <tbody {...rest} className={classNames(className)} />;
};

export const Tr: React.FC<HTMLAttributes<HTMLTableRowElement>> = ({ className, ...rest }) => {
    return <tr {...rest} className={classNames(className)} />;
};

export const Th: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({ className, ...rest }) => {
    return <th {...rest} className={classNames(className, "text-left truncate p-3")} />;
};

export const Td: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...rest }) => {
    const childrenAsString = onlyText(children);
    return (
        <td
            {...rest}
            className={classNames(className, "p-3", {
                // if the table has many columns, do not collapse short string content into multi-line:
                "whitespace-nowrap": childrenAsString.length < 100,
                // prevent table's auto sizing from collapsing a paragraph into a tall-skinny column of broken sentences:
                "min-w-sm": childrenAsString.length > 200,
            })}
        >
            {children}
        </td>
    );
};

/**
 * @see https://github.com/remarkjs/react-markdown/issues/404#issuecomment-604019030
 */
const flatten = (
    text: string,
    child: ReactNode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
    return typeof child === "string"
        ? text + child
        : React.Children.toArray((child as React.ReactElement).props.children).reduce(flatten, text);
};

/**
 * By default, next will use /host/current/slug in SSG.
 * Because of our custom routing (PathResolver) implementation, we need to override the pathname to be /basePath/current/slug.
 * @returns /basepath/current/slug
 */
export function useCurrentPathname(): string {
    const { resolvedPath } = useNavigationContext();
    return `/${resolvedPath.fullSlug}`;
}

export const H1: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => {
    const children = React.Children.toArray(rest.children);
    const text = children.reduce(flatten, "");
    const slug = getSlugFromText(text);

    return (
        <h1
            id={slug}
            className={classNames(className, "flex items-center relative group/anchor-container mb-3")}
            {...rest}
            ref={useAnchorInView(slug)}
        >
            <AbsolutelyPositionedAnchor href={{ hash: slug, pathname: useCurrentPathname() }} />
            <span>{children}</span>
        </h1>
    );
};

export const H2: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => {
    const children = React.Children.toArray(rest.children);
    const text = children.reduce(flatten, "");
    const slug = getSlugFromText(text);
    return (
        <h2
            id={slug}
            className={classNames(className, "flex items-center relative group/anchor-container mb-3")}
            {...rest}
            ref={useAnchorInView(slug)}
        >
            <AbsolutelyPositionedAnchor href={{ hash: slug, pathname: useCurrentPathname() }} />
            <span>{children}</span>
        </h2>
    );
};

export const H3: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => {
    const children = React.Children.toArray(rest.children);
    const text = children.reduce(flatten, "");
    const slug = getSlugFromText(text);
    return (
        <h3
            id={slug}
            className={classNames(className, "flex items-center relative group/anchor-container mb-3")}
            {...rest}
            ref={useAnchorInView(slug)}
        >
            <AbsolutelyPositionedAnchor href={{ hash: slug, pathname: useCurrentPathname() }} />
            <span>{children}</span>
        </h3>
    );
};

export const H4: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => {
    const children = React.Children.toArray(rest.children);
    const text = children.reduce(flatten, "");
    const slug = getSlugFromText(text);
    return (
        <h4
            id={slug}
            className={classNames(className, "flex items-center relative group/anchor-container mb-3")}
            {...rest}
            ref={useAnchorInView(slug)}
        >
            <AbsolutelyPositionedAnchor href={{ hash: slug, pathname: useCurrentPathname() }} />
            <span>{children}</span>
        </h4>
    );
};

export const H5: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => {
    const children = React.Children.toArray(rest.children);
    const text = children.reduce(flatten, "");
    const slug = getSlugFromText(text);
    return (
        <h5
            id={slug}
            className={classNames(className, "flex items-center relative group/anchor-container mb-3")}
            {...rest}
            ref={useAnchorInView(slug)}
        >
            <AbsolutelyPositionedAnchor href={{ hash: slug, pathname: useCurrentPathname() }} />
            <span>{children}</span>
        </h5>
    );
};

export const H6: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => {
    const children = React.Children.toArray(rest.children);
    const text = children.reduce(flatten, "");
    const slug = getSlugFromText(text);
    return (
        <h6
            id={slug}
            className={classNames(className, "flex items-center relative group/anchor-container mb-3")}
            {...rest}
            ref={useAnchorInView(slug)}
        >
            <AbsolutelyPositionedAnchor href={{ hash: slug, pathname: useCurrentPathname() }} />
            {children}
        </h6>
    );
};

export const P: React.FC<{ variant: "api" | "markdown" } & HTMLAttributes<HTMLParagraphElement>> = ({
    variant,
    className,
    ...rest
}) => {
    return <p {...rest} />;
};

export const Strong: React.FC<HTMLAttributes<unknown>> = ({ className, ...rest }) => {
    return <strong {...rest} className={classNames(className, "font-semibold")} />;
};

export const Ol: React.FC<HTMLAttributes<HTMLOListElement>> = ({ className, ...rest }) => {
    return <ol {...rest} className={classNames(className, "list-outside list-decimal space-y-2 mb-3")} />;
};

export const Ul: React.FC<DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>> = ({
    className,
    ...rest
}) => {
    return <ul {...rest} className={classNames(className, "list-outside list-disc space-y-2 mb-3")} />;
};

export const Li: React.FC<DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>> = ({
    className,
    ...rest
}) => {
    return <li {...rest} className={classNames(className, "marker:text-inherit")} />;
};

export const A: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({ className, children, href, ...rest }) => {
    const isExternalUrl = href != null && href.startsWith("http");

    const classNamesCombined = classNames("fern-mdx-link", className);

    const hideExternalLinkIcon = React.isValidElement(children) && (children.type === "img" || children.type === Img);

    return (
        <Link className={classNamesCombined} href={href ?? "#"} target={isExternalUrl ? "_blank" : undefined} {...rest}>
            {React.isValidElement(children) && isImgElement(children)
                ? React.cloneElement<ImgProps>(children, { disableZoom: true })
                : children}

            {isExternalUrl && !hideExternalLinkIcon && <ExternalLinkIcon className="external-link-icon" />}
        </Link>
    );
};

interface ImgProps extends DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    disableZoom?: boolean;
}

function isImgElement(element: ReactNode): element is React.ReactElement<ImgProps> {
    return React.isValidElement(element) && element.type === Img;
}

export const Img: React.FC<ImgProps> = ({ className, src, alt, disableZoom, ...rest }) => {
    const mounted = useMounted();
    if (!mounted || disableZoom) {
        return <img {...rest} className={classNames(className, "max-w-full")} src={src} alt={alt} />;
    }
    return (
        <Zoom>
            <img {...rest} className={classNames(className, "max-w-full")} src={src} alt={alt} />
        </Zoom>
    );
};

export function getSlugFromText(text: string): string {
    return text.toLowerCase().replace(/\W/g, "-").replace(/-+/g, "-");
}
