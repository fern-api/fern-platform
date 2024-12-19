import {
  FernSyntaxHighlighter,
  type ScrollToHandle,
} from "@fern-docs/syntax-highlighter";
import { useResizeObserver } from "@fern-ui/react-commons";
import clsx from "clsx";
import { FC, createRef, useCallback, useEffect, useMemo } from "react";
import { useFeatureFlags } from "../../atoms";
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
    hoveredPropertyPath?: JsonPropertyPath | undefined;
    json: unknown;
    jsonStartLine?: number;
    scrollAreaStyle?: React.CSSProperties;
    measureHeight?: (height: number) => void;
  }
}

const CodeSnippetExampleInternal: FC<CodeSnippetExample.Props> = ({
  id,
  code,
  language,
  hoveredPropertyPath,
  json,
  jsonStartLine,
  scrollAreaStyle,
  measureHeight,
  className,
  ...props
}) => {
  const { isDarkCodeEnabled } = useFeatureFlags();
  const codeBlockRef = createRef<HTMLPreElement>();
  const viewportRef = createRef<ScrollToHandle>();

  useResizeObserver(codeBlockRef, ([entry]) => {
    if (entry != null) {
      measureHeight?.(entry.contentRect.height);
    }
  });

  const requestHighlightLines = useHighlightJsonLines(
    json,
    hoveredPropertyPath,
    jsonStartLine
  );

  useEffect(() => {
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
        "dark bg-card-solid": isDarkCodeEnabled,
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
