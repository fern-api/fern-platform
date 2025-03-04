"use client";

import {
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  forwardRef,
} from "react";

import { cn } from "@fern-docs/components";
import { CopyToClipboardButton, SemanticColor } from "@fern-docs/components";

import { useIsDarkCode } from "@/state/dark-code";

export declare namespace TitledExample {
  export interface Props {
    title: ReactNode;
    intent?: SemanticColor;
    tryIt?: ReactElement<any>;
    languageDropdown?: ReactElement<any>;
    className?: string;
    copyToClipboardText?: () => string; // use provider to lazily compute clipboard text
    onClick?: MouseEventHandler<HTMLDivElement>;
    disableClipboard?: boolean;
  }
}

export const TitledExample = forwardRef<
  HTMLDivElement,
  PropsWithChildren<TitledExample.Props>
>(function TitledExample(
  {
    title,
    intent = "none",
    className,
    tryIt,
    languageDropdown,
    children,
    copyToClipboardText,
    onClick,
    disableClipboard = false,
  },
  ref
) {
  const isDarkCode = useIsDarkCode();
  return (
    <div
      className={cn(
        "bg-card-background border-card-border rounded-3 shadow-card-grayscale relative flex flex-col overflow-hidden border",
        "max-md:max-h-content-height-padded",
        { "bg-card-solid dark": isDarkCode },
        className
      )}
      onClick={onClick}
      ref={ref}
    >
      <div
        className={cn("rounded-t-inherit h-10", {
          "bg-(color:--grayscale-a2)":
            intent === "none" || intent === "primary",
          "bg-(color:--amber-a2)": intent === "warning",
          "bg-(color:--green-a2)": intent === "success",
          "bg-(color:--red-a2)": intent === "danger",
        })}
      >
        <div className="border-card-border rounded-inherit flex min-h-10 items-center justify-between border-b px-2">
          {typeof title === "string" ? (
            <div
              className={cn("px-1 text-sm", {
                "text-(color:--grayscale-a11)":
                  intent === "none" || intent === "primary",
                "text-(color:--amber-a11)": intent === "warning",
                "text-(color:--green-a11)": intent === "success",
                "text-(color:--red-a11)": intent === "danger",
              })}
            >
              {title}
            </div>
          ) : (
            <div className="min-w-0 flex-1 shrink">{title}</div>
          )}
          <div className="flex items-center gap-2">
            {languageDropdown}
            {!disableClipboard && (
              <CopyToClipboardButton
                content={copyToClipboardText}
                className="-m-1"
              />
            )}
          </div>
        </div>
      </div>
      {children}
      {tryIt}
    </div>
  );
});
