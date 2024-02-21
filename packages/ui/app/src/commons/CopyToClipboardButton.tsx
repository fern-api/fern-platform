import { useCopyToClipboard } from "@fern-ui/react-commons";
import { CopyIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { Check } from "react-feather";
import { FernButton } from "../components/FernButton";
import { FernTooltip, FernTooltipProvider } from "../components/FernTooltip";

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
        <FernTooltipProvider>
            <FernTooltip
                content={wasJustCopied ? "Copied!" : "Copy to clipboard"}
                open={wasJustCopied ? true : undefined}
            >
                <FernButton
                    className={classNames("group", className)}
                    onClick={copyToClipboard}
                    disabled={copyToClipboard == null}
                    data-testid={testId}
                    rounded={true}
                    icon={wasJustCopied ? <Check className="size-4" /> : <CopyIcon className="size-4" />}
                    variant="minimal"
                    intent={wasJustCopied ? "success" : "none"}
                />
            </FernTooltip>
        </FernTooltipProvider>
    );
};
