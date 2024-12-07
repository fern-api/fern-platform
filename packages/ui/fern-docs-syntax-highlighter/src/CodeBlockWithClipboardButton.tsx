import { CopyToClipboardButton, cn } from "@fern-ui/components";
import React, { PropsWithChildren } from "react";
import { useFeatureFlags } from "./SyntaxHighlighterFeatureFlags";

type CodeBlockWithClipboardButtonProps = {
    code: string;
};

export const CodeBlockWithClipboardButton: React.FC<PropsWithChildren<CodeBlockWithClipboardButtonProps>> = ({
    code,
    children,
}) => {
    const { isDarkCodeEnabled } = useFeatureFlags();
    return (
        <div
            className={cn(
                "not-prose group/cb-container bg-card relative mb-6 mt-4 flex w-full rounded-lg shadow-sm border border-[var(--grayscale-a5)]",
                { "dark bg-card-solid": isDarkCodeEnabled },
            )}
        >
            {children}
            <CopyToClipboardButton
                className={cn(
                    "absolute z-20",
                    "transition opacity-0 group-hover/cb-container:opacity-100 z-10",
                    "right-1 top-1",
                )}
                content={code}
            />
        </div>
    );
};
