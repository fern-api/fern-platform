"use client";

import { Check, Copy } from "lucide-react";

import { useCopyToClipboard } from "@fern-ui/react-commons";

import { Button } from "./FernButtonV2";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";
import { cn } from "./cn";

export declare namespace CopyToClipboardButton {
  export interface Props {
    className?: string;
    content?: string | (() => string | Promise<string>);
    testId?: string;
    children?: (
      onClick: ((e: React.MouseEvent) => void) | undefined
    ) => React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
  }
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButton.Props> = ({
  className,
  content,
  testId,
  children,
  onClick,
}) => {
  const { copyToClipboard, wasJustCopied } = useCopyToClipboard(content);

  if (content == null) {
    return null;
  }

  return (
    <FernTooltipProvider>
      <FernTooltip
        content={wasJustCopied ? "Copied!" : "Copy to clipboard"}
        open={wasJustCopied ? true : undefined}
      >
        {children?.((e) => {
          onClick?.(e);
          void copyToClipboard?.();
        }) ?? (
          <Button
            className={cn("fern-copy-button group", className)}
            disabled={copyToClipboard == null}
            onClickCapture={(e) => {
              onClick?.(e);
              void copyToClipboard?.();
            }}
            data-testid={testId}
            variant={wasJustCopied ? "success" : "ghost"}
            size="iconSm"
          >
            {wasJustCopied ? <Check /> : <Copy />}
          </Button>
        )}
      </FernTooltip>
    </FernTooltipProvider>
  );
};
