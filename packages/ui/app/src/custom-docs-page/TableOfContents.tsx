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

    if (headings.length === 0) {
        return null;
    }

    return (
        <div className={classNames("w-64", className)}>
            <div className="flex flex-col">
                <div className="medium text-text-primary-light dark:text-text-primary-dark mb-3 uppercase">
                    On this page
                </div>
                <div className="flex flex-col gap-3">
                    {headings.map((heading, index) => (
                        <Text
                            key={index}
                            className="t-muted hover:dark:text-text-primary-dark hover:text-text-primary-light cursor-pointer transition"
                            style={{ marginLeft: 8 * (heading.depth - minDepth) }}
                            ellipsize
                        >
                            <a href={`#${getSlugFromText(heading.text)}`}>{heading.text}</a>
                        </Text>
                    ))}
                </div>
            </div>
        </div>
    );
};

function isHeading(token: marked.Token): token is marked.Tokens.Heading {
    return token.type === "heading";
}
