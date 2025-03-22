"use client";

import {
  CSSProperties,
  ReactElement,
  createContext,
  memo,
  useContext,
  useRef,
  useState,
} from "react";

import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

import { FernLink } from "@/components/FernLink";

export interface TableOfContentsItemProps {
  text: string;
  anchorString: string;
  active: boolean;
  setActiveRef: (ref: HTMLLIElement) => void;
  depth?: number;
}

export const TocExpandedCtx = createContext<boolean>(false);

export const TableOfContentsItem = memo<TableOfContentsItemProps>(
  (props): ReactElement<any> => {
    const { text, anchorString, active, setActiveRef, depth = 0 } = props;
    const ref = useRef<HTMLLIElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useIsomorphicLayoutEffect(() => {
      if (active && ref.current != null) {
        setActiveRef?.(ref.current);
      }
    }, [active, setActiveRef]);

    const [textHeight, setTextHeight] = useState(20);
    const isExpanded = useContext(TocExpandedCtx);

    useIsomorphicLayoutEffect(() => {
      if (
        textRef.current != null &&
        textRef.current.clientHeight > 5 &&
        isExpanded
      ) {
        setTextHeight(textRef.current.clientHeight);
        setTimeout(() => {
          if (
            isExpanded &&
            textRef.current != null &&
            textRef.current.clientHeight > 5
          ) {
            setTextHeight(textRef.current?.clientHeight ?? 20);
          }
        }, 250);
      }
    }, [textRef, isExpanded]);

    return (
      <li
        className="fern-toc-item"
        ref={ref}
        data-depth={depth}
        data-state={active ? "active" : "inactive"}
        style={{ "--expanded-link-height": `${textHeight}px` } as CSSProperties}
      >
        <FernLink href={`#${anchorString}`}>
          <div
            className="fern-toc-line"
            style={{ width: `${24 - 8 * depth}px` }}
          />
          <div
            ref={textRef}
            className="fern-toc-text"
            style={{ paddingLeft: `${depth * 12}px` }}
          >
            {text}
          </div>
        </FernLink>
      </li>
    );
  }
);

TableOfContentsItem.displayName = "TableOfContentsItem";

export function OnThisPageTitle() {
  const textRef = useRef<HTMLDivElement>(null);
  const [textHeight, setTextHeight] = useState(20);

  const isExpanded = useContext(TocExpandedCtx);

  useIsomorphicLayoutEffect(() => {
    if (
      textRef.current != null &&
      textRef.current.scrollHeight > 5 &&
      isExpanded
    ) {
      setTextHeight(textRef.current.scrollHeight);
      setTimeout(() => {
        if (
          isExpanded &&
          textRef.current != null &&
          textRef.current.scrollHeight > 5
        ) {
          setTextHeight(textRef.current?.scrollHeight ?? 20);
        }
      }, 250);
    }
  }, [textRef, isExpanded]);

  return (
    <div
      ref={textRef}
      className="fern-toc-title"
      style={{ "--expanded-link-height": `${textHeight}px` } as CSSProperties}
    >
      On this page
    </div>
  );
}
