import classNames from "classnames";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CodeBlockWithClipboardButton } from "../../commons/CodeBlockWithClipboardButton";
import { parseCodeBlockLanguageFromClassName } from "../../commons/util";
import {
    A,
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    InlineCode,
    Li,
    Ol,
    P,
    Table,
    Td,
    Th,
    Thead,
    Tr,
    Ul,
} from "../../mdx/base-components";
import styles from "./Markdown.module.scss";

export declare namespace Markdown {
    export interface Props {
        children?: string;
        className?: string;
    }
}

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

export const Markdown = React.memo<Markdown.Props>(function Markdown({ children, className }) {
    if (children == null) {
        return null;
    }
    return (
        <ReactMarkdown
            className={classNames(className, styles.container, "prose prose-sm dark:prose-invert max-w-none")}
            remarkPlugins={REMARK_PLUGINS}
            rehypePlugins={REHYPE_PLUGINS}
            components={{
                pre({ children }) {
                    // This element seems to come pre-styled and, by default, wraps all code blocks with a weird black
                    // container. We need to ignore it and just render its children.
                    // TODO: Confirm that this does not affect any components other than code blocks
                    // If other elements are affected, we need to determine whether we're dealing with a code
                    // block or some other component in this block and return the default value (whatever that is)
                    return <>{children}</>;
                },
                code({ node, inline = false, className, children, ...props }) {
                    if (!inline && className != null) {
                        const content = Array.isArray(children) ? children[0] : undefined;
                        if (typeof content !== "string") {
                            return null;
                        }
                        const language = parseCodeBlockLanguageFromClassName(className);
                        return (
                            <CodeBlockWithClipboardButton
                                language={language}
                                content={content}
                                clipboardButtonDistanceFromEdges="sm"
                            />
                        );
                    }
                    return <InlineCode {...props}>{children}</InlineCode>;
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
                p: ({ node, ...props }) => <P variant="api" {...props} />,
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
