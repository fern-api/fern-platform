import { parseStringStyle, visit } from "@fern-docs/mdx";
import { FernScrollArea } from "@fern-docs/components";
import cn from "clsx";
import type { Element } from "hast";
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { ItemProps, TableVirtuoso, TableVirtuosoHandle } from "react-virtuoso";
import {
  FernSyntaxHighlighterTokensProps,
  ScrollToHandle,
  fernSyntaxHighlighterTokenPropsAreEqual,
} from "./FernSyntaxHighlighterTokens";
import { HastToJSX } from "./HastToJsx";
import { flattenHighlightLines, getLineHeight, getMaxHeight } from "./utils";

interface CodeBlockContext {
  fontSize: "sm" | "base" | "lg";
  highlightStyle: "highlight" | "focus" | undefined;
  highlightedLines: number[];
  lang: string;
  wordWrap?: boolean;
}

const CodeBlockTable = forwardRef<
  HTMLTableElement,
  FernScrollArea.Props & { context?: CodeBlockContext }
>(({ children, context, ...props }, ref) => {
  const fontSize = context?.fontSize ?? "base";
  const highlightStyle = context?.highlightStyle;
  const highlightedLines = context?.highlightedLines ?? [];
  const lang = context?.lang ?? "plaintext";
  const plaintext = lang === "plaintext" || lang === "text" || lang === "txt";

  return (
    <code
      className={cn("code-block", {
        "text-xs": fontSize === "sm",
        "text-sm": fontSize === "base",
        "text-base": fontSize === "lg",
      })}
    >
      <div className="code-block-inner">
        <table
          className={cn("code-block-line-group", {
            "highlight-focus":
              highlightStyle === "focus" && highlightedLines.length > 0,
            "word-wrap": context?.wordWrap,
          })}
          {...props}
          ref={ref}
        >
          {!plaintext && (
            <colgroup>
              <col className="w-fit" />
              <col />
            </colgroup>
          )}
          {children}
        </table>
      </div>
    </code>
  );
});

CodeBlockTable.displayName = "CodeBlockTable";

const CodeBlockTableRow = forwardRef<
  HTMLTableRowElement,
  ItemProps<Element> & { context?: CodeBlockContext }
>(({ context, ...props }, ref) => (
  <tr
    {...props}
    ref={ref}
    className={cn("code-block-line", {
      highlight: context?.highlightedLines.includes(props["data-index"]),
    })}
  />
));

CodeBlockTableRow.displayName = "CodeBlockTableRow";

export const FernSyntaxHighlighterTokensVirtualized = memo(
  forwardRef<HTMLPreElement, FernSyntaxHighlighterTokensProps>((props, ref) => {
    const {
      className,
      style,
      fontSize = "base",
      highlightLines,
      highlightStyle,
      viewportRef,
      tokens,
      maxLines,
      wordWrap,
    } = props;

    const virtuosoRef = useRef<TableVirtuosoHandle>(null);
    const [scrollerRef, setScrollerRef] = useState<HTMLElement | Window | null>(
      null
    );

    useImperativeHandle<ScrollToHandle, ScrollToHandle>(
      viewportRef,
      (): ScrollToHandle => ({
        scrollTo(options) {
          if (virtuosoRef.current) {
            virtuosoRef.current?.scrollTo(options);
          }
        },
        scrollToLast(options) {
          if (virtuosoRef.current) {
            virtuosoRef.current?.scrollToIndex({
              index: "LAST",
              behavior: options?.behavior === "smooth" ? "smooth" : "auto",
            });
          }
        },
        get clientHeight() {
          return scrollerRef instanceof HTMLElement
            ? scrollerRef.clientHeight
            : 0;
        },
        get scrollHeight() {
          return scrollerRef instanceof HTMLElement
            ? scrollerRef.scrollHeight
            : 0;
        },
      })
    );

    const preStyle = useMemo(() => {
      let preStyle = {};

      visit(tokens.hast, "element", (node) => {
        if (node.tagName === "pre") {
          preStyle = parseStringStyle(node.properties.style) ?? {};
          return false; // stop traversing
        }
        return true;
      });
      return preStyle;
    }, [tokens.hast]);

    const lines = useMemo(() => {
      const lines: Element[] = [];
      visit(tokens.hast, "element", (node) => {
        if (node.tagName === "code") {
          node.children.forEach((child) => {
            if (child.type === "element" && child.tagName === "span") {
              lines.push(child);
            }
          });
        }
      });
      return lines;
    }, [tokens.hast]);

    const context = useMemo<CodeBlockContext>(
      () => ({
        fontSize,
        lang: tokens.lang,
        highlightStyle,
        highlightedLines: flattenHighlightLines(highlightLines ?? []),
        wordWrap,
      }),
      [fontSize, highlightLines, highlightStyle, tokens.lang, wordWrap]
    );

    const lang = tokens.lang;
    const gutterCli = lang === "cli" || lang === "shell" || lang === "bash";
    const plaintext =
      tokens.lang === "plaintext" ||
      tokens.lang === "text" ||
      tokens.lang === "txt";

    const itemContent = useCallback(
      (lineNumber: number, line: Element) => (
        <>
          {!plaintext && (
            <td className="code-block-line-gutter">
              <span>
                {gutterCli ? (lineNumber === 0 ? "$" : ">") : lineNumber + 1}
              </span>
            </td>
          )}
          <td className="code-block-line-content">
            <HastToJSX hast={line} />
          </td>
        </>
      ),
      [gutterCli, plaintext]
    );

    return (
      <pre
        className={cn("code-block-root not-prose", className)}
        style={{ ...style, ...preStyle }}
        ref={ref}
        tabIndex={0}
      >
        <TableVirtuoso<Element, CodeBlockContext>
          context={context}
          components={{
            Scroller: FernScrollArea,
            Table: CodeBlockTable,
            TableRow: CodeBlockTableRow,
          }}
          ref={virtuosoRef}
          scrollerRef={setScrollerRef}
          style={{
            height: getMaxHeight(
              fontSize,
              Math.min(maxLines ?? lines.length, lines.length)
            ),
          }}
          data={lines}
          initialItemCount={lines.length}
          fixedItemHeight={getLineHeight(fontSize)}
          itemContent={itemContent}
          overscan={1000}
        />
      </pre>
    );
  }),
  fernSyntaxHighlighterTokenPropsAreEqual
);

FernSyntaxHighlighterTokensVirtualized.displayName =
  "FernSyntaxHighlighterTokensVirtualized";
