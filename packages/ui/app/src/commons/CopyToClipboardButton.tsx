import { useCopyToClipboard } from "@fern-ui/react-commons";
import classNames from "classnames";
import { FernButton } from "../components/FernButton";
import { CheckIcon } from "./icons/CheckIcon";
import { CopyIcon } from "./icons/CopyIcon";

export declare namespace CopyToClipboardButton {
    export interface Props {
        className?: string;
        content?: string | (() => string);
        testId?: string;
    }
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButton.Props> = ({ className, content, testId }) => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(content);

    return (
        <FernButton
            className={classNames("group cursor-pointer", className)}
            onClick={copyToClipboard}
            disabled={copyToClipboard == null}
            data-testid={testId}
            rounded={true}
            icon={wasJustCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            buttonStyle="minimal"
            intent={wasJustCopied ? "success" : "none"}
        />
    );
};
