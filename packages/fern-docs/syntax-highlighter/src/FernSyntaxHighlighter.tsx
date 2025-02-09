"use client";

import { forwardRef, useMemo } from "react";
import {
  FernSyntaxHighlighterTokens,
  ScrollToHandle,
} from "./FernSyntaxHighlighterTokens";
import { FernSyntaxHighlighterTokensVirtualized } from "./FernSyntaxHighlighterTokensVirtualized";
import { createRawTokens, highlightTokens, useHighlighter } from "./fernShiki";

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
}

export const FernSyntaxHighlighter = forwardRef<
  HTMLPreElement,
  FernSyntaxHighlighterProps
>((props, ref) => {
  const { id, code, language, ...innerProps } = props;
  const highlighter = useHighlighter(language);

  const tokens = useMemo(() => {
    if (highlighter == null) {
      return createRawTokens(code, language);
    }
    try {
      return highlightTokens(highlighter, code, language);
    } catch (e) {
      // TODO: sentry

      console.error("Error occurred while highlighting tokens", e);
      return createRawTokens(code, language);
    }
  }, [code, highlighter, language]);

  const { maxLines } = innerProps;

  const lines = code.split("\n").length;

  const TokenRenderer =
    (maxLines != null && lines <= maxLines + 100) ||
    lines <= 500 ||
    maxLines == null
      ? FernSyntaxHighlighterTokens
      : FernSyntaxHighlighterTokensVirtualized;

  return <TokenRenderer ref={ref} tokens={tokens} {...innerProps} />;
});

FernSyntaxHighlighter.displayName = "FernSyntaxHighlighter";
