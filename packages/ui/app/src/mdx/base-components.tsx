import classNames from "classnames";
import Link from "next/link";
import React, { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { AbsolutelyPositionedAnchor } from "../commons/AbsolutelyPositionedAnchor";
import { useAnchorInView } from "../custom-docs-page/TableOfContentsContext";
import { useNavigationContext } from "../navigation-context";
import { onlyText } from "../util/onlyText";
import styles from "./base-components.module.scss";

export const InlineCode: React.FC<HTMLAttributes<HTMLElement>> = ({ className, ...rest }) => {
    return (
        <code
            {...rest}
            className={classNames(
                className,
                "not-prose inline-code font-mono border border-border-concealed-light dark:border-border-concealed-dark rounded bg-background/75 dark:bg-background-dark/75 py-0.5 px-1"
            )}
        />
    );
};

export const Table: React.FC<HTMLAttributes<HTMLTableElement>> = ({ className, ...rest }) => {
    return (
        <div className="border-border-default-light dark:border-border-default-dark bg-background-primary-light dark:bg-background-primary-dark mb-3 overflow-hidden rounded-lg border">
            <table
                {...rest}
                className={classNames(
                    className,
                    "min-w-full border-separate border-spacing-0 overflow-x-auto table-auto text-sm max-w-full not-prose bg-background-primary-light dark:bg-background-primary-dark"
                )}
            />
        </div>
    );
};

export const Thead: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...rest }) => {
    return <thead {...rest} className={classNames(className)} />;
};

export const Tr: React.FC<HTMLAttributes<HTMLTableRowElement>> = ({ className, ...rest }) => {
    return <tr {...rest} className={classNames(className, "odd:bg-[#FAFAFA]")} />;
};

export const Th: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({ className, ...rest }) => {
    return (
        <th
            {...rest}
            className={classNames(
                className,
                "text-left truncate px-3 py-1 leading-7 border-b border-border-default-light dark:border-border-default-dark t-muted text-xs bg-background-primary-light dark:bg-background-primary-dark"
            )}
        />
    );
};

export const Td: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...rest }) => {
    const childrenAsString = onlyText(children);
    return (
        <td
            {...rest}
            className={classNames(className, "px-3 py-1 leading-7", {
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
    child: ReactNode
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
    return (
        <p
            {...rest}
            className={classNames(className, {
                "mb-3": variant === "markdown",
            })}
        />
    );
};

export const Strong: React.FC<HTMLAttributes<unknown>> = ({ className, ...rest }) => {
    return <strong {...rest} className={classNames(className, "font-semibold")} />;
};

export const Ol: React.FC<HTMLAttributes<HTMLOListElement>> = ({ className, ...rest }) => {
    return <ol {...rest} className={classNames(className, "list-outside list-decimal space-y-2 mb-3 ml-6")} />;
};

export const Ul: React.FC<HTMLAttributes<HTMLUListElement>> = ({ className, ...rest }) => {
    return <ul {...rest} className={classNames(className, "list-outside space-y-2 mb-3")} />;
};

export const Li: React.FC<HTMLAttributes<HTMLLIElement>> = ({ className, ...rest }) => {
    return <li {...rest} className={classNames(className, "marker:text-inherit")} />;
};

export const A: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({ className, children, href, ...rest }) => {
    const isExternalUrl = href != null && href.includes("http");

    const classNamesCombined = classNames(className, styles.mdxAnchor);

    return (
        <Link
            className={classNamesCombined}
            href={href ?? "#"}
            target={isExternalUrl ? "_blank" : undefined}
            rel={isExternalUrl ? "noopener noreferrer" : undefined}
            {...rest}
        >
            {children}
        </Link>
    );
};

export function getSlugFromText(text: string): string {
    return text.toLowerCase().replace(/\W/g, "-").replace(/-+/g, "-");
}
