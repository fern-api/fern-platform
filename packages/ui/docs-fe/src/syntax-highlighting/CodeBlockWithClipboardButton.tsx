import { CopyToClipboardButton } from "@fern-ui/components";
import cn, { clsx } from "clsx";
import React, { PropsWithChildren } from "react";
import { useFeatureFlags } from "../atoms";

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
            className={clsx(
                "not-prose group/cb-container bg-card ring-card-border relative mb-6 mt-4 flex w-full rounded-lg shadow-sm ring-1 ring-inset",
                {
                    "bg-card-solid dark": isDarkCodeEnabled,
                },
            )}
        >
            {children}
            <CopyToClipboardButton
                className={clsx(
                    "absolute z-20",
                    "z-10 opacity-0 transition group-hover/cb-container:opacity-100",
                    "right-1 top-1",
                )}
                content={code}
            />
        </div>
    );
};
