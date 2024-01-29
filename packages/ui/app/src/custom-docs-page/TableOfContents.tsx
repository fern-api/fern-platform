/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TableOfContentsItem } from "@fern-ui/app-utils";
import classNames from "classnames";
import { CSSProperties } from "react";
import { getSlugFromText } from "../mdx/base-components";

export declare namespace TableOfContents {
    export interface Props {
        className?: string;
        style?: CSSProperties;
        tableOfContents: TableOfContentsItem[];
    }
}

export const TableOfContents: React.FC<TableOfContents.Props> = ({ className, tableOfContents, style }) => {
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

    return (
        <>
            {tableOfContents.length > 0 && <h6 className="m-0">On this page</h6>}
            {renderList(tableOfContents)}
        </>
    );
};
