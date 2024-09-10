import { clsx } from "clsx";
import { CSSProperties, ReactNode, useEffect, useMemo, useState } from "react";
import { useCallbackOne } from "use-memo-one";
import { ANCHOR_ATOM, useAtomEffect } from "../../atoms";
import { TableOfContentsItem } from "./TableOfContentsItem";
import { useTableOfContentsObserver } from "./useTableOfContentsObserver";

export declare namespace TableOfContents {
    export interface Props {
        className?: string;
        style?: CSSProperties;
        tableOfContents: TableOfContentsItem[];
    }
}

let anchorJustSet = false;
let anchorJustSetTimeout: number;

export const TableOfContents: React.FC<TableOfContents.Props> = ({ className, tableOfContents, style }) => {
    const allAnchors = useMemo(() => {
        const flatten = (items: TableOfContentsItem[]): string[] =>
            items.flatMap((item) => [item.anchorString, ...flatten(item.children)]);
        return flatten(tableOfContents);
    }, [tableOfContents]);

    const [anchorInView, setAnchorInView] = useState(() => allAnchors[0]);

    useEffect(() => {
        setAnchorInView(allAnchors[0]);
    }, [allAnchors]);

    useAtomEffect(
        useCallbackOne(
            (get) => {
                const currentPathAnchor = get(ANCHOR_ATOM);
                if (currentPathAnchor != null && allAnchors.includes(currentPathAnchor)) {
                    anchorJustSet = true;
                    setAnchorInView(currentPathAnchor);
                    clearTimeout(anchorJustSetTimeout);
                    anchorJustSetTimeout = window.setTimeout(() => {
                        anchorJustSet = false;
                    }, 200);
                }
            },
            [allAnchors],
        ),
    );

    useTableOfContentsObserver(
        allAnchors,
        useCallbackOne(
            (id: string) => {
                if (!anchorJustSet) {
                    setAnchorInView(id);
                }
            },
            [setAnchorInView],
        ),
    );

    const [liHeight, setLiHeight] = useState<number>(20);
    const [offsetTop, setOffsetTop] = useState<number>(0);

    const setActiveRef = useCallbackOne((liRef: HTMLLIElement) => {
        setLiHeight(liRef.getBoundingClientRect().height);
        setOffsetTop(liRef.offsetTop);
    }, []);

    const flattenTableOfContents = (items: TableOfContentsItem[], depth = 0): ReactNode => {
        return items.flatMap(({ simpleString: text, anchorString, children }) => {
            if (text.length === 0) {
                // don't render empty headings
                return [];
            }
            return [
                <TableOfContentsItem
                    key={`${depth}-${anchorString}`}
                    text={text}
                    anchorString={anchorString}
                    active={anchorInView === anchorString}
                    setActiveRef={setActiveRef}
                    depth={depth}
                />,
                flattenTableOfContents(children, depth + 1),
            ];
        });
    };

    return (
        <>
            {tableOfContents.length > 0 && (
                <div className="m-0 mb-3 text-sm font-medium text-grayscale-a11">On this page</div>
            )}
            {tableOfContents.length > 0 && (
                <ul
                    className={clsx("toc-root", className)}
                    style={{ ...style, "--height": `${liHeight}px`, "--top": `${offsetTop}px` } as CSSProperties}
                >
                    {flattenTableOfContents(tableOfContents)}
                </ul>
            )}
        </>
    );
};
