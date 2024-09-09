import cn from "clsx";
import { useAtomValue } from "jotai";
import { CSSProperties } from "react";
import { useMemoOne } from "use-memo-one";
import { createAnchorInViewAtom, createTocAtom, type TableOfContentsItem } from "../atoms";
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
                        "hover:t-default block hyphens-auto break-words py-1.5 text-sm leading-5 transition-all hover:transition-none",
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
    const allAnchorsAtom = useMemoOne(() => createTocAtom(tableOfContents), [tableOfContents]);
    const anchorInViewAtom = useMemoOne(() => createAnchorInViewAtom(allAnchorsAtom), [allAnchorsAtom]);
    const anchorInView = useAtomValue(anchorInViewAtom);

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
