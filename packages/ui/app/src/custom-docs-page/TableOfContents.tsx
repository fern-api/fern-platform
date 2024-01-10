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
    heading: marked.Tokens.Heading;
    children: HeadingListItem[];
}

export const TableOfContents: React.FC<TableOfContents.Props> = ({ className, markdown, style }) => {
    const renderList = (headings: HeadingListItem[], indent?: boolean) => {
        return (
            <ul className={classNames("list-none", { "ml-4": indent, "-my-2": !indent })} style={style}>
                {headings.map(({ heading, children }, index) => {
                    return (
                        <li key={index}>
                            <a
                                className="t-muted hover:dark:text-text-primary-dark hover:text-text-primary-light block hyphens-auto break-words py-2 text-sm leading-5 no-underline transition hover:no-underline"
                                href={`#${getSlugFromText(tokenToSimpleString(heading))}`}
                            >
                                {tokenToSimpleString(heading)}
                            </a>
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

    return <div className={className}>{renderList(listItems)}</div>;
};

const makeTree = (headings: marked.Tokens.Heading[], depth: number = 1): HeadingListItem[] => {
    const tree: HeadingListItem[] = [];

    const tokens = [...headings];
    while (tokens.length > 0) {
        const firstToken = tokens[0]!;

        // Stop if next heading is at higher level
        if (firstToken.depth < depth) {
            break;
        }

        // Remove first token from list
        const token = tokens.shift()!;

        // Find children of current token
        const children = makeTree(tokens, token.depth + 1);

        // Add token and its children to the tree
        tree.push({
            heading: token,
            children,
        });
    }

    return tree;
};

function isHeading(token: marked.Token): token is marked.Tokens.Heading {
    return token.type === "heading";
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
