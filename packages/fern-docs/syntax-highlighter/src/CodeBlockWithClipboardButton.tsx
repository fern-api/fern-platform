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
        "not-prose bg-card-background border-(color:--grayscale-a5) rounded-3 group relative mb-6 mt-4 flex w-full border shadow-sm",
        className
      )}
    >
      {children}
      <CopyToClipboardButton
        className={cn(
          "fern-copy-button absolute z-20",
          "opacity-0 backdrop-blur transition group-hover:opacity-100",
          "right-2 top-2"
        )}
        content={code}
      />
    </div>
  );
};
