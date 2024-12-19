import { CopyToClipboardButton, cn } from "@fern-docs/components";
import React, { PropsWithChildren } from "react";
import { useFeatureFlags } from "./SyntaxHighlighterFeatureFlags";

type CodeBlockWithClipboardButtonProps = {
  code: string;
};

export const CodeBlockWithClipboardButton: React.FC<
  PropsWithChildren<CodeBlockWithClipboardButtonProps>
> = ({ code, children }) => {
  const { isDarkCodeEnabled } = useFeatureFlags();
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
          "absolute z-20",
          "z-10 opacity-0 transition group-hover/cb-container:opacity-100",
          "right-1 top-1"
        )}
        content={code}
      />
    </div>
  );
};
