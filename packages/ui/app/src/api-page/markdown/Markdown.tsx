import { Code } from "@blueprintjs/core";
import classNames from "classnames";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { A, H1, H2, H3, H4, H5, H6, Li, Ol, Table, Td, Th, Thead, Tr, Ul } from "../../mdx/base-components";
import styles from "./Markdown.module.scss";

export declare namespace Markdown {
    export interface Props {
        /**
         * - `"markdown"`: Markdown pages.
         * - `"api"`: API reference pages.
         */
        type: "markdown" | "api";
        children: string;
        className?: string;
    }
}

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

const PRISM_CLASSNAME_REGEX = /language-(\w+)/;

export const Markdown = React.memo<Markdown.Props>(function Markdown({ type, children, className }) {
    return (
        <ReactMarkdown
            className={classNames(className, styles.container, "prose prose-sm dark:prose-invert max-w-none")}
            remarkPlugins={REMARK_PLUGINS}
            rehypePlugins={REHYPE_PLUGINS}
            components={{
                pre({ className, ...props }) {
                    return <pre className={classNames(className, "border border-border/60")} {...props} />;
                },
                code({ node, inline = false, className, children, ...props }) {
                    if (!inline && className != null) {
                        const match = PRISM_CLASSNAME_REGEX.exec(className);
                        if (match != null) {
                            return (
                                <SyntaxHighlighter
                                    {...props}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        backgroundColor: "transparent",
                                        padding: 0,
                                        fontSize: "0.9rem",
                                    }}
                                    language={match[1]}
                                    PreTag="div"
                                >
                                    {String(children)}
                                </SyntaxHighlighter>
                            );
                        }
                    }
                    return (
                        <Code
                            {...props}
                            className={classNames(
                                className,
                                "border border-border/60 !bg-neutral-900/50 !text-white !py-0.5 !px-1"
                            )}
                        >
                            {children}
                        </Code>
                    );
                },
                table: (props) => <Table {...props} />,
                thead: (props) => <Thead {...props} />,
                tr: (props) => <Tr {...props} />,
                th: (props) => <Th {...props} />,
                td: (props) => <Td {...props} />,
                h1: (props) => <H1 {...props} />,
                h2: (props) => <H2 {...props} />,
                h3: (props) => <H3 {...props} />,
                h4: (props) => <H4 {...props} />,
                h5: (props) => <H5 {...props} />,
                h6: (props) => <H6 {...props} />,
                p: ({ node, ...props }) => (
                    <p
                        {...props}
                        className={classNames(
                            "mb-3",
                            {
                                "text-base font-light text-text-default leading-7": type === "markdown",
                                "text-sm text-text-default leading-6": type === "api",
                            },
                            props.className
                        )}
                    />
                ),
                ol: (props) => <Ol {...props} />,
                ul: (props) => <Ul {...props} />,
                li: (props) => <Li {...props} />,
                a: (props) => <A {...props} />,
            }}
        >
            {children}
        </ReactMarkdown>
    );
});
