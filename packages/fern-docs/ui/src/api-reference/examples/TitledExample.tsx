import { CopyToClipboardButton, SemanticColor } from "@fern-docs/components";
import cn from "clsx";
import {
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  forwardRef,
} from "react";

export declare namespace TitledExample {
  export interface Props {
    title: ReactNode;
    intent?: SemanticColor;
    actions?: ReactElement;
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
        "rounded-xl overflow-hidden flex flex-col bg-card after:ring-card-border after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-[''] relative shadow-sm",
        "max-md:max-h-content-padded",
        className
      )}
      onClick={onClick}
      ref={ref}
    >
      <div
        className={cn("rounded-t-xl h-10", {
          "bg-tag-default-soft": intent === "none" || intent === "primary",
          "bg-tag-warning-soft": intent === "warning",
          "bg-tag-success-soft": intent === "success",
          "bg-tag-danger-soft": intent === "danger",
        })}
      >
        <div className="mx-px flex min-h-10 items-center justify-between rounded-t-xl px-2 shadow-[inset_0_-1px_0_0] shadow-card-border">
          {typeof title === "string" ? (
            <div
              className={cn("text-sm px-1", {
                "t-muted": intent === "none" || intent === "primary",
                "t-warning": intent === "warning",
                "t-success": intent === "success",
                "t-danger": intent === "danger",
              })}
            >
              {title}
            </div>
          ) : (
            <div className="min-w-0 flex-1 shrink">{title}</div>
          )}
          <div className="flex gap-2">
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
