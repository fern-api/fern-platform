import classNames from "classnames";
import { parse } from "node-html-parser";
import { CSSProperties, useContext, useMemo } from "react";
import { getSlugFromText } from "../mdx/base-components";
import { TableOfContentsContext } from "./TableOfContentsContext";

export declare namespace TableOfContents {
    export interface Props {
        className?: string;
        style?: CSSProperties;
        renderedHtml: string;
    }
}

export const TableOfContents: React.FC<TableOfContents.Props> = ({ className, renderedHtml, style }) => {
    const { anchorInView } = useContext(TableOfContentsContext);
    const tableOfContents = useMemo(() => generateTableOfContents(renderedHtml), [renderedHtml]);
    const renderList = (headings: TableOfContentsItem[], indent?: boolean) => {
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
                {headings.map(({ simpleString: text, children }, index) => {
                    if (text.length === 0 && children.length === 0) {
                        // don't render empty headings
                        return null;
                    }
                    const anchor = getSlugFromText(text);
                    return (
                        <li key={index}>
                            {text.length > 0 && (
                                <a
                                    className={classNames(
                                        "hover:dark:text-text-primary-dark hover:text-text-primary-light block hyphens-auto break-words py-1.5 text-sm leading-5 no-underline transition hover:no-underline",
                                        {
                                            "t-muted": anchorInView !== anchor,
                                            "text-accent-primary dark:text-accent-primary-dark":
                                                anchorInView === anchor,
                                        }
                                    )}
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

    return (
        <>
            {tableOfContents.length > 0 && <h6 className="m-0">On this page</h6>}
            {renderList(tableOfContents)}
        </>
    );
};

interface TableOfContentsItem {
    simpleString: string;
    children: TableOfContentsItem[];
}

function generateTableOfContents(html: string): TableOfContentsItem[] {
    const doc = parse(html);
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

    const parsedHeadings = Array.from(headings)
        .map((heading) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            depth: parseInt(heading.tagName[1]!),
            text: heading.textContent?.trim() ?? "",
        }))
        .filter((heading) => heading.text.length > 0);

    const minDepth = Math.min(...parsedHeadings.map((heading) => heading.depth));

    return makeTree(parsedHeadings, minDepth);
}

const makeTree = (
    headings: {
        depth: number;
        text: string;
    }[],
    depth: number = 1
): TableOfContentsItem[] => {
    const tree: TableOfContentsItem[] = [];

    while (headings.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const firstToken = headings[0]!;

        // if the next heading is at a higher level
        if (firstToken.depth < depth) {
            break;
        }

        if (firstToken.depth === depth) {
            const token = headings.shift();
            const simpleString = token != null ? token.text.trim() : "";
            tree.push({
                simpleString,
                children: makeTree(headings, depth + 1),
            });
        } else {
            tree.push({
                simpleString: "",
                children: makeTree(headings, depth + 1),
            });
        }
    }

    return tree;
};
