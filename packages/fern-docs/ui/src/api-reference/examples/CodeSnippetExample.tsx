import {
  FernSyntaxHighlighter,
  type ScrollToHandle,
} from "@fern-docs/syntax-highlighter";
import { useResizeObserver } from "@fern-ui/react-commons";
import clsx from "clsx";
import { isEqual } from "instantsearch.js/es/lib/utils";
import {
  FC,
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useEdgeFlags } from "../../atoms";
import { FernErrorBoundary } from "../../components/FernErrorBoundary";
import { JsonPropertyPath } from "./JsonPropertyPath";
import { TitledExample } from "./TitledExample";
import { useHighlightJsonLines } from "./useHighlightJsonLines";

export declare namespace CodeSnippetExample {
  export interface Props
    extends Omit<TitledExample.Props, "copyToClipboardText"> {
    // hast: Root;
    id?: string;
    code: string;
    language: string;
    // hoveredPropertyPath?: JsonPropertyPath | undefined;
    json: unknown;
    jsonStartLine?: number;
    scrollAreaStyle?: React.CSSProperties;
    measureHeight?: (height: number) => void;
    type: "request" | "response" | "payload";
    slug: string;
  }
}

const CodeSnippetExampleInternal: FC<CodeSnippetExample.Props> = ({
  id,
  code,
  language,
  // hoveredPropertyPath,
  json,
  jsonStartLine,
  scrollAreaStyle,
  measureHeight,
  className,
  type,
  ...props
}) => {
  const { isDarkCodeEnabled } = useEdgeFlags();
  const codeBlockRef = createRef<HTMLPreElement>();
  const viewportRef = createRef<ScrollToHandle>();

  useResizeObserver(codeBlockRef, ([entry]) => {
    if (entry != null) {
      measureHeight?.(entry.contentRect.height);
    }
  });

  const [hoveredPropertyPath, setHoveredPropertyPath] =
    useState<JsonPropertyPath>([]);

  useEffect(() => {
    const handleHoverJsonProperty = (event: Event) => {
      if (event instanceof CustomEvent && event.detail.type === type) {
        setHoveredPropertyPath((prev) => {
          if (event.detail.isHovering) {
            return event.detail.jsonpath;
          }
          return isEqual(prev, event.detail.jsonpath) ? [] : prev;
        });
      }
    };
    window.addEventListener("hover-json-property", handleHoverJsonProperty);
    return () => {
      window.removeEventListener(
        "hover-json-property",
        handleHoverJsonProperty
      );
    };
  }, [type]);

  const requestHighlightLines = useHighlightJsonLines(
    json,
    hoveredPropertyPath,
    jsonStartLine
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      if (viewportRef.current != null && requestHighlightLines[0] != null) {
        const lineNumber = Array.isArray(requestHighlightLines[0])
          ? requestHighlightLines[0][0]
          : requestHighlightLines[0];
        const offsetTop =
          (lineNumber - 1) * 19.5 - viewportRef.current.clientHeight / 4;
        viewportRef.current.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  }, [requestHighlightLines, viewportRef]);

  // Scroll to top when code changes
  useEffect(() => {
    viewportRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <TitledExample
      copyToClipboardText={useCallback(() => code, [code])}
      {...props}
      className={clsx(className, {
        "bg-card-solid dark": isDarkCodeEnabled,
      })}
    >
      <FernSyntaxHighlighter
        id={id}
        className="rounded-t-0 rounded-b-[inherit]"
        ref={codeBlockRef}
        style={scrollAreaStyle}
        viewportRef={viewportRef}
        language={language}
        fontSize="sm"
        highlightLines={requestHighlightLines}
        code={code}
      />
    </TitledExample>
  );
};

export const CodeSnippetExample: FC<CodeSnippetExample.Props> = (props) => {
  return (
    <FernErrorBoundary component="CodeSnippetExample">
      <CodeSnippetExampleInternal {...props} />
    </FernErrorBoundary>
  );
};

export declare namespace JsonCodeSnippetExample {
  export interface Props
    extends Omit<
      CodeSnippetExample.Props,
      "language" | "jsonStartLine" | "code"
    > {}
}

export const JsonCodeSnippetExample: FC<JsonCodeSnippetExample.Props> = (
  props
) => {
  const code = useMemo(() => JSON.stringify(props.json, null, 2), [props.json]);
  return <CodeSnippetExample {...props} language="json" code={code} />;
};
