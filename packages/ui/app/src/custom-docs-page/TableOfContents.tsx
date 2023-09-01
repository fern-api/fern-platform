import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { marked } from "marked";
import { useMemo } from "react";
import { getSlugFromText } from "../mdx/base-components";

export declare namespace TableOfContents {
    export interface Props {
        className?: string;
        markdown: string;
    }
}

export const TableOfContents: React.FC<TableOfContents.Props> = ({ className, markdown }) => {
    const headings = useMemo(() => marked.lexer(markdown).filter(isHeading), [markdown]);
    const minDepth = useMemo(() => Math.min(...headings.map((heading) => heading.depth)), [headings]);

    return (
        <div className={classNames("w-64", className)}>
            {headings.length > 0 && (
                <div className="flex flex-col gap-3">
                    {headings.map((heading, index) => (
                        <Text
                            key={index}
                            className="t-muted hover:dark:text-text-primary-dark hover:text-text-primary-light cursor-pointer transition"
                            style={{ marginLeft: 8 * (heading.depth - minDepth) }}
                            ellipsize
                        >
                            <a
                                href={`#${getSlugFromText(heading.text)}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                {heading.text}
                            </a>
                        </Text>
                    ))}
                </div>
            )}
        </div>
    );
};

function isHeading(token: marked.Token): token is marked.Tokens.Heading {
    return token.type === "heading";
}
