import cn from "clsx";
import React, { PropsWithChildren } from "react";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

type CodeBlockWithClipboardButtonProps = {
    code: string;
};

export const CodeBlockWithClipboardButton: React.FC<PropsWithChildren<CodeBlockWithClipboardButtonProps>> = ({
    code,
    children,
}) => {
    return (
        <div className="not-prose group/cb-container bg-card relative mb-6 mt-4 flex w-full rounded-lg shadow-sm  after:ring-default after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-inset after:content-['']">
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
