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
        children?: (onClick: (() => void) | undefined) => JSX.Element;
    }
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButton.Props> = ({
    className,
    content,
    testId,
    children,
}) => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(content);

    if (content == null) {
        return null;
    }

    return (
        <FernTooltipProvider>
            <FernTooltip
                content={wasJustCopied ? "Copied!" : "Copy to clipboard"}
                open={wasJustCopied ? true : undefined}
            >
                {children?.(copyToClipboard) ?? (
                    <FernButton
                        className={classNames("group", className)}
                        disabled={copyToClipboard == null}
                        onClick={copyToClipboard}
                        data-testid={testId}
                        rounded={true}
                        icon={wasJustCopied ? <Check className="size-4" /> : <CopyIcon className="size-4" />}
                        variant="minimal"
                        intent={wasJustCopied ? "success" : "none"}
                    />
                )}
            </FernTooltip>
        </FernTooltipProvider>
    );
};
