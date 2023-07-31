import classNames from "classnames";
import React, { HTMLAttributes } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { AbsolutelyPositionedAnchor } from "../commons/AbsolutelyPositionedAnchor";

export const CodeBlock: React.FC<HTMLAttributes<HTMLElement>> = ({ children }) => {
    if (children == null || typeof children !== "object") {
        return null;
    }
    const { className, children: nestedChildren } = (children as JSX.Element).props as {
        className: string | undefined;
        children: string;
    };
    const language = className != null ? className.replace(/language-/, "") : "";
    return (
        <pre className={classNames("px-4 pt-1 mb-5 border rounded-lg bg-gray-950/90 border-border/60")}>
            <SyntaxHighlighter
                style={vscDarkPlus}
                customStyle={{
                    backgroundColor: "transparent",
                    padding: 0,
                    fontSize: "0.9rem",
                }}
                language={language}
                PreTag="div"
            >
                {String(nestedChildren)}
            </SyntaxHighlighter>
        </pre>
    );
};

export const InlineCode: React.FC<HTMLAttributes<HTMLElement>> = ({ className, ...rest }) => {
    return (
        <code
            {...rest}
            className={classNames(
                className,
                "border border-border/60 rounded font-mono text-sm !bg-neutral-900/50 !text-white !py-0.5 !px-1"
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
                "text-sm text-left truncate px-2 py-1 font-normal text-text-stark leading-7 border-b border-border"
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
                "text-base border-b border-border-concealed font-light px-2 py-2 text-text-default leading-7"
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
    const slug = text.toLowerCase().replace(/\W/g, "-");
    return (
        <h1
            id={slug}
            className={classNames(className, "relative group/anchor-container text-2xl font-semibold mt-10 mb-3")}
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
    const slug = text.toLowerCase().replace(/\W/g, "-");
    return (
        <h2
            id={slug}
            className={classNames(className, "relative group/anchor-container text-xl font-semibold mt-10 mb-3")}
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
    const slug = text.toLowerCase().replace(/\W/g, "-");
    return (
        <h3
            id={slug}
            className={classNames(className, "relative group/anchor-container text-lg font-semibold mt-10 mb-3")}
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
    const slug = text.toLowerCase().replace(/\W/g, "-");
    return (
        <h4
            id={slug}
            className={classNames(className, "relative group/anchor-container text-lg font-semibold mt-10 mb-3")}
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
    const slug = text.toLowerCase().replace(/\W/g, "-");
    return (
        <h5
            id={slug}
            className={classNames(className, "relative group/anchor-container text-lg font-semibold mt-10 mb-3")}
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
    const slug = text.toLowerCase().replace(/\W/g, "-");
    return (
        <h6
            id={slug}
            className={classNames(className, "relative group/anchor-container text-lg font-semibold mt-10 mb-3")}
            {...rest}
        >
            <AbsolutelyPositionedAnchor anchor={slug} verticalPosition="center" />
            {children}
        </h6>
    );
};

export const P: React.FC<{ variant: "sm" | "md" } & HTMLAttributes<HTMLParagraphElement>> = ({
    variant,
    className,
    ...rest
}) => {
    return (
        <p
            {...rest}
            className={classNames(className, "mb-3", {
                "text-sm font-normal text-text-default leading-6": variant === "sm",
                "text-base font-light text-text-default leading-7": variant === "md",
            })}
        />
    );
};

export const Ol: React.FC<HTMLAttributes<HTMLOListElement>> = ({ className, ...rest }) => {
    return <ol {...rest} className={classNames(className, "list-inside list-decimal space-y-2 mb-3")} />;
};

export const Ul: React.FC<HTMLAttributes<HTMLUListElement>> = ({ className, ...rest }) => {
    return <ul {...rest} className={classNames(className, "list-image-dash list-inside space-y-2 mb-3")} />;
};

export const Li: React.FC<HTMLAttributes<HTMLLIElement>> = ({ className, ...rest }) => {
    return <li {...rest} className={classNames(className, "text-base font-light text-text-default leading-7")} />;
};

export const A: React.FC<HTMLAttributes<HTMLAnchorElement>> = ({ className, ...rest }) => {
    return (
        <a
            {...rest}
            className={classNames(
                className,
                "transition !text-white hover:!text-accentPrimary !no-underline !border-b hover:!border-b-2 !border-b-accentPrimary hover:border-b-accentPrimary hover:no-underline font-medium"
            )}
        />
    );
};
