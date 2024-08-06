import cn from "clsx";
import { useAtomValue } from "jotai";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { ANCHOR_ATOM } from "../atoms";
import { FernLink } from "./FernLink";

export declare namespace TableOfContents {
    export interface HTMLProps {
        className?: string;
        style?: CSSProperties;
        renderedHtml: string;
    }

    export interface Props {
        className?: string;
        style?: CSSProperties;
        tableOfContents: TableOfContentsItem[];
    }
}

let anchorJustSet = false;
let anchorJustSetTimeout: number;

function TableOfContentsItem({
    text,
    anchorString,
    items,
    anchorInView,
}: {
    text: string;
    anchorString: string;
    items: TableOfContentsItem[];
    anchorInView?: string;
}) {
    return (
        <li>
            {text.length > 0 && (
                <FernLink
                    className={cn(
                        "hover:t-default block hyphens-auto break-words py-1.5 text-sm leading-5 transition-all",
                        {
                            "t-muted": anchorInView !== anchorString,
                            "t-accent-aaa": anchorInView === anchorString,
                        },
                    )}
                    href={`#${anchorString}`}
                >
                    {text}
                </FernLink>
            )}
            {items.length > 0 && <TableOfContentsList headings={items} indent={true} anchorInView={anchorInView} />}
        </li>
    );
}

function TableOfContentsList({
    headings,
    indent,
    rootClassName,
    rootStyle,
    anchorInView,
}: {
    headings: TableOfContentsItem[];
    indent?: boolean;
    rootClassName?: string;
    rootStyle?: CSSProperties;
    anchorInView?: string | undefined;
}) {
    if (headings.length === 0) {
        return null;
    }
    return (
        <ul
            className={cn("list-none", {
                "pl-4": indent,
                [rootClassName ?? ""]: !indent,
                "pt-3 pb-4": !indent,
            })}
            style={!indent ? rootStyle : undefined}
        >
            {headings.map(({ simpleString: text, anchorString, children }, index) => {
                if (text.length === 0 && children.length === 0) {
                    // don't render empty headings
                    return null;
                }
                return (
                    <TableOfContentsItem
                        key={index}
                        text={text}
                        anchorString={anchorString}
                        items={children}
                        anchorInView={anchorInView}
                    />
                );
            })}
        </ul>
    );
}

export const TableOfContents: React.FC<TableOfContents.Props> = ({ className, tableOfContents, style }) => {
    const currentPathAnchor = useAtomValue(ANCHOR_ATOM);

    const allAnchors = useMemo(() => getAllAnchorStrings(tableOfContents), [tableOfContents]);

    const [anchorInView, setAnchorInView] = useState(currentPathAnchor ?? allAnchors[0]);

    useEffect(() => {
        if (currentPathAnchor != null) {
            setAnchorInView(currentPathAnchor);
            anchorJustSet = true;
            clearTimeout(anchorJustSetTimeout);
            anchorJustSetTimeout = window.setTimeout(() => {
                anchorJustSet = false;
            }, 150);
        }
    }, [currentPathAnchor]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleScroll = () => {
            const scrollY = window.scrollY;

            // when the user scrolls to the very top of the page, set the anchorInView to the first anchor
            if (scrollY === 0) {
                setAnchorInView(allAnchors[0]);
                return;
            }

            // when the user scrolls to the very bottom of the page, set the anchorInView to the last anchor
            if (window.innerHeight + scrollY >= document.body.scrollHeight) {
                setAnchorInView(allAnchors[allAnchors.length - 1]);
                return;
            }

            // when the user scrolls down, check if an anchor has just scrolled up just past 40% from the top of the viewport
            // if so, set the anchorInView to that anchor

            if (!anchorJustSet) {
                for (let i = allAnchors.length - 1; i >= 0; i--) {
                    const anchor = allAnchors[i];
                    if (anchor == null) {
                        continue;
                    }
                    const element = document.getElementById(anchor);
                    if (element != null) {
                        const { bottom } = element.getBoundingClientRect();
                        if (bottom < window.innerHeight * 0.5) {
                            setAnchorInView(anchor);
                            break;
                        }
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [allAnchors, tableOfContents]);

    return (
        <>
            {tableOfContents.length > 0 && <h6 className="m-0">On this page</h6>}
            {tableOfContents.length > 0 && (
                <TableOfContentsList
                    headings={tableOfContents}
                    indent={false}
                    anchorInView={anchorInView}
                    rootClassName={className}
                    rootStyle={style}
                />
            )}
        </>
    );
};

export interface TableOfContentsItem {
    simpleString: string;
    anchorString: string;
    children: TableOfContentsItem[];
}

function getAllAnchorStrings(tableOfContents: TableOfContentsItem[]): string[] {
    return tableOfContents.flatMap((item) => [item.anchorString, ...getAllAnchorStrings(item.children)]);
}
