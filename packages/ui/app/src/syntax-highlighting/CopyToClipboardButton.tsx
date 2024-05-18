import { FernButton, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { useCopyToClipboard } from "@fern-ui/react-commons";
import { CopyIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { Check } from "react-feather";

export declare namespace CopyToClipboardButton {
    export interface Props {
        className?: string;
        content?: string | (() => string);
        testId?: string;
        children?: (onClick: ((e: React.MouseEvent) => void) | undefined) => React.ReactNode;
        onClick?: (e: React.MouseEvent) => void;
    }
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButton.Props> = ({
    className,
    content,
    testId,
    children,
    onClick,
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
                {children?.((e) => {
                    onClick?.(e);
                    copyToClipboard?.();
                }) ?? (
                    <FernButton
                        className={cn("group fern-copy-button", className)}
                        disabled={copyToClipboard == null}
                        onClickCapture={(e) => {
                            onClick?.(e);
                            copyToClipboard?.();
                        }}
                        data-testid={testId}
                        rounded={true}
                        icon={wasJustCopied ? <Check className="size-4" /> : <CopyIcon className="size-4" />}
                        variant="minimal"
                        intent={wasJustCopied ? "success" : "none"}
                        disableAutomaticTooltip={true}
                    />
                )}
            </FernTooltip>
        </FernTooltipProvider>
    );
};
