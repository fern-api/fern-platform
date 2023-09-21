import classNames from "classnames";
import Link from "next/link";
import React, { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { AbsolutelyPositionedAnchor } from "../commons/AbsolutelyPositionedAnchor";
import { useDocsContext } from "../docs-context/useDocsContext";

export const InlineCode: React.FC<HTMLAttributes<HTMLElement>> = ({ className, ...rest }) => {
    return (
        <code
            {...rest}
            className={classNames(
                className,
                "border border-border-default-light dark:border-border-default-dark rounded font-mono text-sm !bg-background !text-text-primary-light dark:!text-text-primary-dark !py-0.5 !px-1"
            )}
        />
    );
};

export const Table: React.FC<HTMLAttributes<HTMLTableElement>> = ({ className, ...rest }) => {
    return (
        <table
            {...rest}
            className={classNames(
                className,
                "block border-separate border-spacing-y-2 overflow-x-auto table-auto mb-3"
            )}
        />
    );
};

export const Thead: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...rest }) => {
    return <thead {...rest} className={classNames(className)} />;
};

export const Tr: React.FC<HTMLAttributes<HTMLTableRowElement>> = ({ className, ...rest }) => {
    return <tr {...rest} className={classNames(className)} />;
};

export const Th: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({ className, ...rest }) => {
    return (
        <th
            {...rest}
            className={classNames(
                className,
                "text-sm text-left truncate px-2 py-1 font-normal text-text-primary-light dark:text-text-primary-dark leading-7 border-b border-border-default-light dark:border-border-default-dark"
            )}
        />
    );
};

export const Td: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({ className, ...rest }) => {
    return (
        <td
            {...rest}
            className={classNames(
                className,
                "text-base border-b border-border-default-light dark:border-border-default-dark font-light px-2 py-2 !text-text-muted-light dark:!text-text-muted-dark leading-7"
            )}
        />
    );
};

/**
 * @see https://github.com/remarkjs/react-markdown/issues/404#issuecomment-604019030
 */
const flatten = (
    text: string,
    child: string | number | React.ReactElement | React.ReactFragment | React.ReactPortal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
    return typeof child === "string"
        ? text + child
        : React.Children.toArray((child as React.ReactElement).props.children).reduce(flatten, text);
};

export const H1: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => {
    const children = React.Children.toArray(rest.children);
    const text = children.reduce(flatten, "");
    const slug = getSlugFromText(text);
    return (
        <h1
            id={slug}
            className={classNames(
                className,
                "relative group/anchor-container scroll-mt-16 !text-text-primary-light dark:!text-text-primary-dark text-2xl font-semibold mt-10 mb-3"
            )}
            {...rest}
        >
            <AbsolutelyPositionedAnchor anchor={slug} verticalPosition="center" />
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
            className={classNames(
                className,
                "relative group/anchor-container scroll-mt-16 !text-text-primary-light dark:!text-text-primary-dark text-xl font-semibold mt-10 mb-3"
            )}
            {...rest}
        >
            <AbsolutelyPositionedAnchor anchor={slug} verticalPosition="center" />
            {children}
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
            className={classNames(
                className,
                "relative group/anchor-container scroll-mt-16 !text-text-primary-light dark:!text-text-primary-dark text-lg font-semibold mt-10 mb-3"
            )}
            {...rest}
        >
            <AbsolutelyPositionedAnchor anchor={slug} verticalPosition="center" />
            {children}
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
            className={classNames(
                className,
                "relative group/anchor-container scroll-mt-16 !text-text-primary-light dark:!text-text-primary-dark text-lg font-semibold mt-10 mb-3"
            )}
            {...rest}
        >
            <AbsolutelyPositionedAnchor anchor={slug} verticalPosition="center" />
            {children}
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
            className={classNames(
                className,
                "relative group/anchor-container scroll-mt-16 !text-text-primary-light dark:!text-text-primary-dark text-lg font-semibold mt-10 mb-3"
            )}
            {...rest}
        >
            <AbsolutelyPositionedAnchor anchor={slug} verticalPosition="center" />
            {children}
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
            className={classNames(
                className,
                "relative group/anchor-container scroll-mt-16 !text-text-primary-light dark:!text-text-primary-dark text-lg font-semibold mt-10 mb-3"
            )}
            {...rest}
        >
            <AbsolutelyPositionedAnchor anchor={slug} verticalPosition="center" />
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
                "text-sm font-normal text-text-muted-light dark:text-text-muted-dark leading-6": variant === "api",
                "text-base font-light text-text-muted-light dark:text-text-muted-dark leading-7":
                    variant === "markdown",
                "mb-3": variant === "markdown",
            })}
        />
    );
};

export const Strong: React.FC<HTMLAttributes<unknown>> = ({ className, ...rest }) => {
    return (
        <strong
            {...rest}
            className={classNames(className, "!text-text-primary-light dark:!text-text-primary-dark font-semibold")}
        />
    );
};

export const Ol: React.FC<HTMLAttributes<HTMLOListElement>> = ({ className, ...rest }) => {
    return <ol {...rest} className={classNames(className, "list-outside list-decimal space-y-2 mb-3 ml-6")} />;
};

export const Ul: React.FC<HTMLAttributes<HTMLUListElement>> = ({ className, ...rest }) => {
    return (
        <ul
            {...rest}
            className={classNames(
                className,
                "list-image-dash-light list-outside dark:list-image-dash-dark space-y-2 mb-3 ml-[22px]" // 22px is the width of the dash svg
            )}
        />
    );
};

export const Li: React.FC<HTMLAttributes<HTMLLIElement>> = ({ className, ...rest }) => {
    return (
        <li
            {...rest}
            className={classNames(
                className,
                "text-base font-light !text-text-muted-light dark:!text-text-muted-dark leading-7"
            )}
        />
    );
};

export const A: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({ className, children, href, ...rest }) => {
    const { navigateToPath } = useDocsContext();

    const isInternalUrl = typeof href === "string" && href.startsWith("/");

    const classNamesCombined = classNames(
        className,
        "!text-text-primary-light dark:!text-text-primary-dark hover:!text-accent-primary hover:dark:!text-accent-primary !no-underline !border-b hover:!border-b-2 !border-b-accent-primary hover:border-b-accent-primary hover:no-underline font-medium"
    );

    if (isInternalUrl) {
        const slug = href.slice(1, href.length);
        return (
            <Link className={classNamesCombined} href={href} onClick={() => navigateToPath(slug)} {...rest}>
                {children}
            </Link>
        );
    }

    return (
        <a {...rest} href={href} className={classNamesCombined}>
            {children}
        </a>
    );
};

export function getSlugFromText(text: string): string {
    return text.toLowerCase().replace(/\W/g, "-");
}
