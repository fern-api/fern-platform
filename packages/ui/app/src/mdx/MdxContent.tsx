import classNames from "classnames";
import { MDXRemote, MDXRemoteProps, MDXRemoteSerializeResult } from "next-mdx-remote";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Card } from "./components/Card";
import { Cards } from "./components/Cards";

export declare namespace MdxContent {
    export interface Props {
        mdx: MDXRemoteSerializeResult;
    }
}

const COMPONENTS: MDXRemoteProps["components"] = {
    pre: (props) => {
        const { children } = props;
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
    },
    code: (props) => {
        const { className, children } = props;
        return (
            <code
                {...props}
                className={classNames(
                    className,
                    "border border-border/60 rounded font-mono text-sm !bg-neutral-900/50 !text-white !py-0.5 !px-1"
                )}
            >
                {children}
            </code>
        );
    },
    table: (props) => (
        <table
            {...props}
            className={classNames(
                props.className,
                "block border-separate border-spacing-y-2 overflow-x-auto table-auto mb-3"
            )}
        />
    ),
    thead: (props) => <thead {...props} className={classNames(props.className)} />,
    tr: (props) => <tr {...props} className={classNames(props.className)} />,
    th: (props) => (
        <th
            {...props}
            className={classNames(
                props.className,
                "text-sm text-left truncate px-2 py-1 font-normal text-text-stark leading-7 border-b border-border"
            )}
        />
    ),
    td: (props) => (
        <td
            {...props}
            className={classNames(
                props.className,
                "text-base border-b border-border-concealed font-light px-2 py-2 text-text-default leading-7"
            )}
        />
    ),
    h1: (props) => <h1 {...props} className={classNames(props.className, "text-2xl font-semibold mt-10 mb-3")} />,
    h2: (props) => <h2 {...props} className={classNames(props.className, "text-xl font-semibold mt-10 mb-3")} />,
    h3: (props) => <h3 {...props} className={classNames(props.className, "text-lg font-semibold mt-10 mb-3")} />,
    h4: (props) => <h4 {...props} className={classNames(props.className, "text-lg font-semibold mt-10 mb-3")} />,
    h5: (props) => <h5 {...props} className={classNames(props.className, "text-lg font-semibold mt-10 mb-3")} />,
    h6: (props) => <h6 {...props} className={classNames(props.className, "text-lg font-semibold mt-10 mb-3")} />,
    p: (props) => (
        <p
            {...props}
            className={classNames(props.className, "mb-3 text-base font-light text-text-default leading-7")}
        />
    ),
    P: (props) => <p {...props} className={classNames("mb-3 text-base", props.className)} />,
    ol: (props) => <ol {...props} className={classNames("list-inside list-decimal space-y-2 mb-3", props.className)} />,
    ul: (props) => (
        <ul {...props} className={classNames("list-image-dash list-inside space-y-2 mb-3", props.className)} />
    ),
    li: ({ children, ...rest }) => (
        <li {...rest} className={classNames(rest.className, "text-base font-light text-text-default leading-7")}>
            {children}
        </li>
    ),
    a: (props) => (
        <a
            {...props}
            className={classNames(
                "transition !text-white hover:!text-accentPrimary !no-underline !border-b hover:!border-b-2 !border-b-accentPrimary hover:border-b-accentPrimary hover:no-underline font-medium",
                props.className
            )}
        />
    ),
    Cards,
    Card,
};

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    return <MDXRemote {...mdx} components={COMPONENTS}></MDXRemote>;
});
