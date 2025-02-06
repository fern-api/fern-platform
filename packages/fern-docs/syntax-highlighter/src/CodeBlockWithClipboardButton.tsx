import { CopyToClipboardButton, cn } from "@fern-docs/components";
import React, { PropsWithChildren } from "react";
import { useEdgeFlags } from "./SyntaxHighlighterEdgeFlags";

type CodeBlockWithClipboardButtonProps = {
  code: string;
};

export const CodeBlockWithClipboardButton: React.FC<
  PropsWithChildren<CodeBlockWithClipboardButtonProps>
> = ({ code, children }) => {
  const { isDarkCodeEnabled } = useEdgeFlags();
  return (
    <div
      className={cn(
        "not-prose group/cb-container bg-card relative mb-6 mt-4 flex w-full rounded-lg border border-[var(--grayscale-a5)] shadow-sm",
        { "bg-card-solid dark": isDarkCodeEnabled }
      )}
    >
      {children}
      <CopyToClipboardButton
        className={cn(
          "fern-copy-button absolute z-20",
          "opacity-0 backdrop-blur transition group-hover/cb-container:opacity-100",
          "right-3 top-2"
        )}
        content={code}
      />
    </div>
  );
};
