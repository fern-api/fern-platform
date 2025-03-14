import React from "react";

import { cleanLanguage } from "@fern-api/fdr-sdk/api-definition";
import { CopyToClipboardButton, cn } from "@fern-docs/components";
import {
  CodeBlockWithClipboardButton,
  FernSyntaxHighlighter,
} from "@fern-docs/components/syntax-highlighter";

import { useIsDarkCode } from "@/state/dark-code";

import { applyTemplates, useTemplate } from "./Template";

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
  /**
   * replaces handlebars in the code with the given values, i.e. {{API_KEY}} -> "1234567890"
   */
  template?: Record<string, string>;
  /**
   * enables rendering tooltips on handlebars in the code
   */
  tooltips?: Record<string, React.ReactNode>;
}) {
  const {
    className,
    code = "",
    title,
    filename,
    language = "plaintext",
    template: templateProp,
    tooltips: tooltipsProp,
  } = props;
  const isDarkCode = useIsDarkCode();

  // merge context templates with the ones passed in
  const template = { ...useTemplate().template, ...templateProp };
  const tooltips = { ...useTemplate().tooltips, ...tooltipsProp };

  if (!code) {
    return null;
  }

  if (title || filename) {
    return (
      <div
        className={cn(
          "bg-card-background after:ring-card-border rounded-3 shadow-card-grayscale relative mb-6 mt-4 flex w-full min-w-0 max-w-full flex-col after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-[''] first:mt-0",
          { "bg-card-solid dark": isDarkCode }
        )}
      >
        <div className="bg-(color:--grayscale-a2) rounded-t-[inherit]">
          <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0]">
            <div className="flex min-h-10 overflow-x-auto">
              <div className="flex items-center px-3 py-1.5">
                <span className="text-(color:--grayscale-a11) rounded-1 text-sm font-semibold">
                  {title ?? language}
                </span>
              </div>
            </div>
            <CopyToClipboardButton
              className="ml-2 mr-1"
              content={() => applyTemplates(code, template)}
            />
          </div>
        </div>
        <FernSyntaxHighlighter
          {...toSyntaxHighlighterProps({ ...props, template, tooltips })}
          className="rounded-b-[inherit]"
        />
      </div>
    );
  }

  return (
    <CodeBlockWithClipboardButton
      code={() => applyTemplates(code, template)}
      className={cn({ "bg-card-solid dark": isDarkCode }, className)}
    >
      <FernSyntaxHighlighter
        {...toSyntaxHighlighterProps({ ...props, template, tooltips })}
      />
    </CodeBlockWithClipboardButton>
  );
}

export function toSyntaxHighlighterProps(
  props: React.ComponentProps<typeof CodeBlock>
): React.ComponentProps<typeof FernSyntaxHighlighter> {
  const highlight = props.highlight ?? props.focus ?? [];
  return {
    language: cleanLanguage(props.language ?? "plaintext"),
    highlightLines: typeof highlight === "number" ? [highlight] : highlight,
    highlightStyle: props.focus != null ? "focus" : "highlight",
    code: props.code ?? "",
    maxLines: props.maxLines ?? 20,
    wordWrap: props.wordWrap,
    template: props.template,
    tooltips: props.tooltips,
  };
}
