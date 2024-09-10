import cn, { clsx } from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { CSSProperties, useEffect, useMemo } from "react";
import { useCallbackOne, useMemoOne } from "use-memo-one";
import { ANCHOR_ATOM } from "../atoms";
import { useRouteChangeComplete } from "../hooks/useRouteChanged";
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
        <li className="mb-2 last:mb-0">
            {text.length > 0 && (
                <FernLink
                    className={cn(
                        "block hyphens-auto break-words text-sm leading-5 transition-all hover:transition-none",
                        {
                            "text-grayscale-a11 hover:text-grayscale-a12": anchorInView !== anchorString,
                            "text-accent-aaa": anchorInView === anchorString,
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

function useIntersectionObserver(ids: string[], setActiveId: (id: string) => void) {
    useEffect(() => {
        const callback: IntersectionObserverCallback = (headings) => {
            const visibleHeadings: IntersectionObserverEntry[] = headings.filter((heading) => heading.isIntersecting);

            const sortedVisibleHeadings = visibleHeadings
                .map((heading) => heading.target.id)
                .sort((a, b) => ids.indexOf(a) - ids.indexOf(b));

            if (sortedVisibleHeadings[0] != null) {
                setActiveId(sortedVisibleHeadings[0]);
            }
        };

        const observer = new IntersectionObserver(callback, {
            rootMargin: "-110px 0px -40% 0px",
        });

        const headingElements = Array.from(document.querySelectorAll(ids.map((id) => `#${id}`).join(", ")));
        headingElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [ids, setActiveId]);
}

export const TableOfContents: React.FC<TableOfContents.Props> = ({ className, tableOfContents, style }) => {
    const allAnchors = useMemo(() => getAllAnchorStrings(tableOfContents), [tableOfContents]);

    const anchorInViewAtom = useMemoOne(() => atomWithDefault(() => allAnchors[0]), [allAnchors]);
    const [anchorInView, setAnchorInView] = useAtom(anchorInViewAtom);

    const currentPathAnchor = useAtomValue(ANCHOR_ATOM);
    useRouteChangeComplete(() => {
        if (currentPathAnchor != null && allAnchors.includes(currentPathAnchor)) {
            setAnchorInView(currentPathAnchor);
            anchorJustSet = true;
            clearTimeout(anchorJustSetTimeout);
            anchorJustSetTimeout = window.setTimeout(() => {
                anchorJustSet = false;
            }, 150);
        }
    });

    useIntersectionObserver(
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

    return (
        <>
            {tableOfContents.length > 0 && <h6 className="m-0">On this page</h6>}
            {tableOfContents.length > 0 && (
                <TableOfContentsList
                    headings={tableOfContents}
                    indent={false}
                    anchorInView={anchorInView}
                    rootClassName={clsx("toc-root", className)}
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
