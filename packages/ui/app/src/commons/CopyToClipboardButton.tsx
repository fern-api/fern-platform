import { useCopyToClipboard } from "@fern-ui/react-commons";
import classNames from "classnames";
import { CheckIcon } from "./icons/CheckIcon";
import { CopyIcon } from "./icons/CopyIcon";

export declare namespace CopyToClipboardButton {
    export interface Props {
        className?: string;
        content?: string;
        testId?: string;
    }
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButton.Props> = ({ className, content, testId }) => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(content);

    return (
        <button
            className={classNames("cursor-pointer", className)}
            onClick={copyToClipboard}
            disabled={copyToClipboard == null}
            data-testid={testId}
        >
            {wasJustCopied ? (
                <div className="bg-tag-primary flex h-4 w-4 items-center justify-center rounded-sm">
                    <CheckIcon className="text-accent-primary h-4 w-4" />
                </div>
            ) : (
                <CopyIcon className="text-intent-default hover:text-accent-primary h-4 w-4 transition-colors" />
            )}
        </button>
    );
};
