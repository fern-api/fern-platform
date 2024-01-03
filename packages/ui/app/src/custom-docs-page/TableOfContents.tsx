import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
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

export const TableOfContents: React.FC<TableOfContents.Props> = ({ className, markdown, style }) => {
    const headings = useMemo(() => marked.lexer(markdown).filter(isHeading), [markdown]);
    const minDepth = useMemo(() => Math.min(...headings.map((heading) => heading.depth)), [headings]);

    return (
        <div className={className} style={style}>
            {headings.length > 0 && (
                <div className="flex flex-col space-y-3 text-sm">
                    {headings.map((heading, index) => (
                        <span
                            key={index}
                            className="t-muted hover:dark:text-text-primary-dark hover:text-text-primary-light cursor-pointer transition"
                            style={{ marginLeft: 8 * (heading.depth - minDepth) }}
                        >
                            <a
                                href={`#${getSlugFromText(tokenToSimpleString(heading))}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                {tokenToSimpleString(heading)}
                            </a>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
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
