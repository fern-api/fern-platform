/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { marked } from "marked";
import { CSSProperties, useMemo } from "react";
import { getSlugFromText } from "../mdx/base-components";

export declare namespace TableOfContents {
    export interface Props {
        className?: string;
        style?: CSSProperties;
        markdown: string;
    }
}

interface HeadingListItem {
    heading: marked.Tokens.Heading | undefined;
    children: HeadingListItem[];
}

export const TableOfContents: React.FC<TableOfContents.Props> = ({ className, markdown, style }) => {
    const renderList = (headings: HeadingListItem[], indent?: boolean) => {
        if (headings.length === 0) {
            return null;
        }
        return (
            <ul
                className={classNames("list-none", {
                    "pl-4": indent,
                    [className ?? ""]: !indent,
                    "pt-3 pb-4 border-b border-border-default-light dark:border-border-default-dark": !indent,
                })}
                style={style}
            >
                {headings.map(({ heading, children }, index) => {
                    const text = heading != null ? tokenToSimpleString(heading) : "";
                    if (text.length === 0 && children.length === 0) {
                        // don't render empty headings
                        return null;
                    }
                    return (
                        <li key={index}>
                            {text.length > 0 && (
                                <a
                                    className="t-muted hover:dark:text-text-primary-dark hover:text-text-primary-light block hyphens-auto break-words py-1.5 text-sm leading-5 no-underline transition hover:no-underline"
                                    href={`#${getSlugFromText(text)}`}
                                >
                                    {text}
                                </a>
                            )}
                            {children.length > 0 && renderList(children, true)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const headings = useMemo(() => marked.lexer(markdown).filter(isHeading), [markdown]);
    const minDepth = useMemo(() => Math.min(...headings.map((heading) => heading.depth)), [headings]);

    const listItems = useMemo(() => makeTree(headings, minDepth), [headings, minDepth]);

    return (
        <>
            {listItems.length > 0 && <h6 className="m-0">On this page</h6>}
            {renderList(listItems)}
        </>
    );
};

const makeTree = (headings: marked.Tokens.Heading[], depth: number = 1): HeadingListItem[] => {
    const tree: HeadingListItem[] = [];

    while (headings.length > 0) {
        const firstToken = headings[0]!;

        // if the next heading is at a higher level
        if (firstToken.depth < depth) {
            break;
        }

        if (firstToken.depth === depth) {
            const token = headings.shift();
            tree.push({
                heading: token != null && tokenToSimpleString(token).length > 0 ? token : undefined,
                children: makeTree(headings, depth + 1),
            });
        } else {
            tree.push({
                heading: undefined,
                children: makeTree(headings, depth + 1),
            });
        }
    }

    return tree;
};

function isHeading(token: marked.Token): token is marked.Tokens.Heading {
    return token.type === "heading" && tokenToSimpleString(token).length > 0;
}

function tokenToSimpleString(token: marked.Token): string {
    return visitDiscriminatedUnion(token, "type")._visit({
        space: () => "",
        code: (value) => value.text,
        heading: (value) => value.tokens.map(tokenToSimpleString).join(""),
        table: () => "",
        hr: () => "",
        blockquote: (value) => value.tokens.map(tokenToSimpleString).join(""),
        list: (value) => value.items.map(tokenToSimpleString).join(""),
        list_item: (value) => value.tokens.map(tokenToSimpleString).join(""),
        paragraph: (value) => value.tokens.map(tokenToSimpleString).join(""),
        html: (value) => value.text,
        text: (value) => value.raw,
        def: (value) => value.title,
        escape: (value) => value.text,
        image: (value) => value.text,
        link: (value) => value.text,
        strong: (value) => value.text,
        em: (value) => value.text,
        codespan: (value) => value.text,
        br: () => "",
        del: (value) => value.text,
        _other: () => "",
    });
}
