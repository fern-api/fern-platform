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
                <div className="flex flex-col space-y-3">
                    {headings.map((heading, index) => (
                        <span
                            key={index}
                            className="t-muted hover:dark:text-text-primary-dark hover:text-text-primary-light cursor-pointer transition"
                            style={{ marginLeft: 8 * (heading.depth - minDepth) }}
                        >
                            <a
                                href={`#${getSlugFromText(heading.text)}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                {heading.text}
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
