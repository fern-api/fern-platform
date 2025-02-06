import type { TableOfContentsItem as TableOfContentsItemType } from "@fern-docs/mdx";
import { clsx } from "clsx";
import fastdom from "fastdom";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCallbackOne } from "use-memo-one";
import { ANCHOR_ATOM, useAtomEffect } from "../../atoms";
import { TableOfContentsItem } from "./TableOfContentsItem";
import { useTableOfContentsObserver } from "./useTableOfContentsObserver";

export declare namespace TableOfContents {
  export interface Props {
    className?: string;
    style?: CSSProperties;
    tableOfContents: TableOfContentsItemType[];
  }
}

let anchorJustSet = false;
let anchorJustSetTimeout: number;

export const TableOfContents: React.FC<TableOfContents.Props> = ({
  className,
  tableOfContents,
  style,
}) => {
  const allAnchors = useMemo(() => {
    const flatten = (items: TableOfContentsItemType[]): string[] =>
      items.flatMap((item) => [item.anchorString, ...flatten(item.children)]);
    return flatten(tableOfContents);
  }, [tableOfContents]);

  const [anchorInView, setAnchorInView] = useState<string | undefined>(
    undefined
  );

  useAtomEffect(
    useCallbackOne(
      (get) => {
        const currentPathAnchor = get(ANCHOR_ATOM);
        if (
          currentPathAnchor != null &&
          allAnchors.includes(currentPathAnchor)
        ) {
          anchorJustSet = true;
          setAnchorInView(currentPathAnchor);
          clearTimeout(anchorJustSetTimeout);
          anchorJustSetTimeout = window.setTimeout(() => {
            anchorJustSet = false;
          }, 500);
        }
      },
      [allAnchors]
    )
  );

  const measure = useTableOfContentsObserver(
    allAnchors,
    useCallback(
      (id: string | undefined) => {
        if (!anchorJustSet) {
          setAnchorInView(id);
        }
      },
      [setAnchorInView]
    )
  );

  useEffect(() => {
    measure();
  }, [measure]);

  const [liHeight, setLiHeight] = useState<number>(0);
  const [offsetTop, setOffsetTop] = useState<number>(0);

  /**
   * when the anchorInView changes to null, reset the height and top of the active li
   */
  useEffect(() => {
    if (anchorInView == null) {
      setLiHeight(0);
      setOffsetTop(0);
    }
  }, [anchorInView]);

  const setActiveRef = useCallbackOne((liRef: HTMLLIElement) => {
    fastdom.measure(() => {
      setLiHeight(liRef.getBoundingClientRect().height);
      setOffsetTop(liRef.offsetTop);
    });
  }, []);

  const flattenTableOfContents = (
    items: TableOfContentsItemType[],
    depth = 0
  ): ReactNode => {
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
        <div className="text-grayscale-a11 m-0 mb-3 text-sm font-medium">
          On this page
        </div>
      )}
      {tableOfContents.length > 0 && (
        <ul
          className={clsx("toc-root not-prose", className)}
          style={
            {
              ...style,
              "--height": `${liHeight}px`,
              "--top": `${offsetTop}px`,
            } as CSSProperties
          }
        >
          {flattenTableOfContents(tableOfContents)}
        </ul>
      )}
    </>
  );
};
