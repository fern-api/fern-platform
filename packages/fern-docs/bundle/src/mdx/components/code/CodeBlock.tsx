import React from "react";

import { cleanLanguage } from "@fern-api/fdr-sdk/api-definition";
import { cn } from "@fern-docs/components";
import {
  CodeBlockWithClipboardButton,
  FernSyntaxHighlighter,
} from "@fern-docs/syntax-highlighter";

import { useIsDarkCode } from "@/state/dark-code";

export function CodeBlock(props: {
  className?: string;
  /**
   * @default "plaintext"
   */
  language?: string;
  /**
   * overrides language for setting the global language state
   * @default language
   */
  for?: string;
  /**
   * @default ""
   */
  code?: string;
  /**
   * sets the lines to highlight
   */
  highlight?: number | number[];
  /**
   * sets the lines to focus
   */
  focus?: number | number[];
  title?: string;
  filename?: string;
  maxLines?: number;
  wordWrap?: boolean;
}) {
  const { className, code = "" } = props;
  const isDarkCodeEnabled = useIsDarkCode();
  return (
    <CodeBlockWithClipboardButton
      code={code}
      className={cn({ "bg-card-solid dark": isDarkCodeEnabled }, className)}
    >
      <FernSyntaxHighlighter {...toSyntaxHighlighterProps(props)} />
    </CodeBlockWithClipboardButton>
  );
}

export function toSyntaxHighlighterProps(
  props: React.ComponentProps<typeof CodeBlock>
): React.ComponentProps<typeof FernSyntaxHighlighter> {
  return {
    language: cleanLanguage(props.language ?? "plaintext"),
    highlightLines:
      typeof props.highlight === "number" ? [props.highlight] : props.highlight,
    highlightStyle: props.focus != null ? "focus" : "highlight",
    code: props.code ?? "",
    maxLines: props.maxLines,
    wordWrap: props.wordWrap,
  };
}
