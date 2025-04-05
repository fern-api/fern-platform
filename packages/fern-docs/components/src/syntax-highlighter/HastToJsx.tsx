"use client";

import { FC, isValidElement, memo, useContext, useMemo } from "react";
import React from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import type { Root, RootContent } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";

import { useCopyToClipboard } from "@fern-ui/react-commons";

import { FernTooltip } from "../FernTooltip";
import { cn } from "../cn";
import { TemplateTooltip } from "./template-tooltip";

interface HastToJSXProps {
  hast: Root | RootContent;
  template?: Record<string, string>;
}

interface TokenProps {
  "data-template"?: string;
  children?: React.ReactNode;
  className?: string;
  role?: string;
  onClick?: () => void;
}

export const HastToJSX: FC<HastToJSXProps> = memo(({ hast, template }) => {
  const tooltips = useContext(TemplateTooltip);

  const result = useMemo(
    () =>
      toJsxRuntime(hast, {
        Fragment,
        // @ts-expect-error: the automatic react runtime is untyped.
        jsx,
        // @ts-expect-error: the automatic react runtime is untyped.
        jsxs,
      }),
    [hast]
  );

  if (!isValidElement<{ children?: React.ReactNode }>(result)) {
    return result;
  }

  return React.cloneElement(
    result,
    undefined,
    ...React.Children.toArray(result.props.children).map(
      (child, i): React.ReactNode => {
        if (isValidElement<TokenProps>(child) && child.props["data-template"]) {
          const tooltipContent = tooltips[child.props["data-template"]];
          const data = template?.[child.props["data-template"]];
          return (
            <TemplateToken key={i} tooltipContent={tooltipContent} data={data}>
              {child}
            </TemplateToken>
          );
        }
        return child;
      }
    )
  );
});

function TemplateToken({
  children,
  tooltipContent,
  data,
}: {
  children: React.ReactNode;
  tooltipContent?: React.ReactNode;
  data?: string;
}) {
  const { copyToClipboard, wasJustCopied } = useCopyToClipboard(
    () => data ?? ""
  );
  const child = React.Children.only(children);
  if (!isValidElement<TokenProps>(child)) {
    throw new Error("TemplateToken must have exactly one child");
  }
  return (
    <FernTooltip
      content={wasJustCopied ? "Copied!" : tooltipContent}
      // tooltip is uncontrolled if wasJustCopied is false
      open={wasJustCopied ? true : undefined}
    >
      {React.cloneElement(
        child,
        {
          className: cn(
            child.props.className,
            "bg-(color:--accent-a3) rounded-1 -m-0.5 cursor-default p-0.5",
            !!data && "hover:bg-(color:--accent-a4) cursor-pointer"
          ),
          role: data ? "button" : undefined,
          onClick: data ? () => void copyToClipboard?.() : undefined,
        },
        data ?? child.props.children
      )}
    </FernTooltip>
  );
}

HastToJSX.displayName = "HastToJSX";
