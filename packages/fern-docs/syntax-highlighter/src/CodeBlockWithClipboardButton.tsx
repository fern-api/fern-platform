import React, { PropsWithChildren } from "react";

import { CopyToClipboardButton, cn } from "@fern-docs/components";

type CodeBlockWithClipboardButtonProps = {
  code: string;
  className?: string;
};

export const CodeBlockWithClipboardButton: React.FC<
  PropsWithChildren<CodeBlockWithClipboardButtonProps>
> = ({ code, children, className }) => {
  return (
    <div
      className={cn(
        "not-prose group/cb-container bg-card-background relative mt-4 mb-6 flex w-full rounded-lg border border-(--grayscale-a5) shadow-sm",
        className
      )}
    >
      {children}
      <CopyToClipboardButton
        className={cn(
          "fern-copy-button absolute z-20",
          "opacity-0 backdrop-blur transition group-hover/cb-container:opacity-100",
          "top-2 right-3"
        )}
        content={code}
      />
    </div>
  );
};
