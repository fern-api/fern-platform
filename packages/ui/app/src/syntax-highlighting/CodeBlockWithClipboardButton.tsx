import classNames from "classnames";
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
        <div className="not-prose group/cb-container bg-card after:ring-default relative mb-6 mt-4 flex max-h-[350px] w-full rounded-lg  shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-inset after:content-['']">
            {children}
            <CopyToClipboardButton
                className={classNames(
                    "absolute z-20",
                    "transition opacity-0 group-hover/cb-container:opacity-100 z-10",
                    "right-1 top-1",
                )}
                content={code}
            />
        </div>
    );
};
