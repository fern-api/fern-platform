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

export declare namespace TitledExample {
  export interface Props {
    title: ReactNode;
    intent?: SemanticColor;
    actions?: ReactElement<any>;
    className?: string;
    copyToClipboardText?: () => string; // use provider to lazily compute clipboard text
    onClick?: MouseEventHandler<HTMLDivElement>;
    disableClipboard?: boolean;
    onMouseOver?: MouseEventHandler<HTMLDivElement>;
    onMouseOut?: MouseEventHandler<HTMLDivElement>;
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
    actions,
    children,
    copyToClipboardText,
    onClick,
    disableClipboard = false,
  },
  ref
) {
  return (
    <div
      className={cn(
        "bg-card-background after:ring-card-border rounded-3 relative flex flex-col overflow-hidden shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-['']",
        "max-md:max-h-content-height-padded",
        className
      )}
      onClick={onClick}
      ref={ref}
    >
      <div
        className={cn("rounded-t-3 h-10", {
          "bg-(--grayscale-a2)": intent === "none" || intent === "primary",
          "bg-(--amber-a2)": intent === "warning",
          "bg-(--green-a2)": intent === "success",
          "bg-(--red-a2)": intent === "danger",
        })}
      >
        <div className="shadow-card-border rounded-t-3 mx-px flex min-h-10 items-center justify-between px-2 shadow-[inset_0_-1px_0_0]">
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
            {actions}
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
    </div>
  );
});
