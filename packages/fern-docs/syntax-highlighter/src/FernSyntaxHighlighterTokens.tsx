import { FernScrollArea } from "@fern-docs/components";
import { parseStringStyle, visit } from "@fern-docs/mdx";
import cn from "clsx";
import type { Element } from "hast";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  memo,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { HastToJSX } from "./HastToJsx";
import { HighlightedTokens } from "./fernShiki";
import {
  flattenHighlightLines,
  getMaxHeight,
  type HighlightLine,
} from "./utils";

export interface ScrollToHandle {
  scrollTo: (options: ScrollToOptions) => void;
  scrollToLast: (options?: ScrollOptions) => void;
  clientHeight: number;
  scrollHeight: number;
}

export interface FernSyntaxHighlighterTokensProps
  extends ComponentPropsWithoutRef<"pre"> {
  tokens: HighlightedTokens;
  fontSize?: "sm" | "base" | "lg";
  highlightLines?: HighlightLine[];
  highlightStyle?: "highlight" | "focus";
  viewportRef?: React.RefObject<ScrollToHandle>;
  maxLines?: number;
  wordWrap?: boolean;
}

export const FernSyntaxHighlighterTokens = memo(
  forwardRef<HTMLPreElement, FernSyntaxHighlighterTokensProps>((props, ref) => {
    const {
      fontSize = "base",
      highlightLines,
      highlightStyle,
      viewportRef,
      tokens,
      maxLines,
      wordWrap,
      ...preProps
    } = props;
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useImperativeHandle<ScrollToHandle, ScrollToHandle>(
      viewportRef,
      (): ScrollToHandle => ({
        scrollTo(options) {
          if (scrollAreaRef.current) {
            scrollAreaRef.current?.scrollTo(options);
          }
        },
        scrollToLast(options) {
          if (scrollAreaRef.current) {
            scrollAreaRef.current?.scrollTo({
              top:
                scrollAreaRef.current.scrollHeight -
                scrollAreaRef.current.clientHeight,
              ...options,
            });
          }
        },
        get clientHeight() {
          return scrollAreaRef.current?.clientHeight ?? 0;
        },
        get scrollHeight() {
          return scrollAreaRef.current?.scrollHeight ?? 0;
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

    const highlightedLines = useMemo(
      () => flattenHighlightLines(highlightLines ?? []),
      [highlightLines]
    );
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

    const lang = tokens.lang;
    const gutterCli = lang === "cli" || lang === "shell" || lang === "bash";
    const plaintext =
      tokens.lang === "plaintext" ||
      tokens.lang === "text" ||
      tokens.lang === "txt";

    return (
      <pre
        tabIndex={-1}
        {...preProps}
        className={cn("code-block-root not-prose", preProps.className)}
        ref={ref}
        style={{ ...preProps.style, ...preStyle }}
      >
        <FernScrollArea
          ref={scrollAreaRef}
          style={{ maxHeight: getMaxHeight(fontSize, maxLines) }}
          asChild
        >
          <code
            className={cn("code-block", {
              "text-xs": fontSize === "sm",
              "text-sm": fontSize === "base",
              "text-base": fontSize === "lg",
            })}
          >
            <table
              className={cn("code-block-line-group", {
                "highlight-focus":
                  highlightStyle === "focus" && highlightedLines.length > 0,
                "word-wrap": wordWrap,
              })}
            >
              {!plaintext && (
                <colgroup>
                  <col className="w-fit" />
                  <col />
                </colgroup>
              )}
              <tbody>
                {lines.map((line, lineNumber) => (
                  <tr
                    className={cn("code-block-line", {
                      highlight: highlightedLines.includes(lineNumber),
                    })}
                    key={lineNumber}
                  >
                    {!plaintext && (
                      <td className="code-block-line-gutter">
                        <span>
                          {gutterCli
                            ? lineNumber === 0
                              ? "$"
                              : ">"
                            : lineNumber + 1}
                        </span>
                      </td>
                    )}
                    <td className="code-block-line-content">
                      <HastToJSX hast={line} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </code>
        </FernScrollArea>
      </pre>
    );
  })
);

FernSyntaxHighlighterTokens.displayName = "FernSyntaxHighlighterTokens";
