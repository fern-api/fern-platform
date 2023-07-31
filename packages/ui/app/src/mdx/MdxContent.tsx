import classNames from "classnames";
import { MDXRemote, MDXRemoteProps, MDXRemoteSerializeResult } from "next-mdx-remote";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { A, H1, H2, H3, H4, H5, H6, Li, Ol, P, Table, Td, Th, Thead, Tr, Ul } from "./base-components";
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
    table: Table,
    thead: Thead,
    tr: Tr,
    th: Th,
    td: Td,
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    p: P,
    P,
    ol: Ol,
    ul: Ul,
    li: Li,
    a: A,
    Cards,
    Card,
};

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    return <MDXRemote {...mdx} components={COMPONENTS}></MDXRemote>;
});
