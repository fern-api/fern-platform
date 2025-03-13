"use client";

import { forwardRef, useMemo } from "react";

import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";

import {
  FernSyntaxHighlighterTokens,
  ScrollToHandle,
} from "./FernSyntaxHighlighterTokens";
import { FernSyntaxHighlighterTokensVirtualized } from "./FernSyntaxHighlighterTokensVirtualized";
import { createRawTokens, highlightTokens, useHighlighter } from "./fernShiki";
import { TemplateTooltip } from "./template-tooltip";

// [number, number] is a range of lines to highlight
type HighlightLine = number | [number, number];

export interface FernSyntaxHighlighterProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  code: string;
  language: string;
  fontSize?: "sm" | "base" | "lg";
  highlightLines?: HighlightLine[];
  highlightStyle?: "highlight" | "focus";
  viewportRef?: React.RefObject<ScrollToHandle | null>;
  maxLines?: number;
  wordWrap?: boolean;
  template?: Record<string, string>;
  tooltips?: Record<string, React.ReactNode>;
}

export const FernSyntaxHighlighter = forwardRef<
  HTMLPreElement,
  FernSyntaxHighlighterProps
>((props, ref) => {
  const { id, code, language, tooltips, template, ...innerProps } = props;
  const highlighter = useHighlighter(language);

  const variableNames = useDeepCompareMemoize(
    new Set([
      ...Object.keys(tooltips ?? EMPTY_OBJECT),
      ...Object.keys(template ?? EMPTY_OBJECT),
    ])
  );

  const tokens = useMemo(() => {
    if (highlighter == null) {
      return createRawTokens(code, language);
    }
    try {
      return highlightTokens(highlighter, code, language, variableNames);
    } catch (e) {
      // TODO: sentry

      console.error("Error occurred while highlighting tokens", e);
      return createRawTokens(code, language);
    }
  }, [code, highlighter, language, variableNames]);

  const { maxLines } = innerProps;

  const lines = code.split("\n").length;

  const TokenRenderer =
    (maxLines != null && lines <= maxLines + 100) ||
    lines <= 500 ||
    maxLines == null
      ? FernSyntaxHighlighterTokens
      : FernSyntaxHighlighterTokensVirtualized;

  return (
    <TemplateTooltip.Provider value={tooltips ?? EMPTY_OBJECT}>
      <TokenRenderer
        ref={ref}
        tokens={tokens}
        template={template}
        {...innerProps}
      />
    </TemplateTooltip.Provider>
  );
});

FernSyntaxHighlighter.displayName = "FernSyntaxHighlighter";
