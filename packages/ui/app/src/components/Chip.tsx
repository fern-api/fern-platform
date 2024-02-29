import { useCopyToClipboard } from "@fern-ui/react-commons";
import classNames from "classnames";
import { ReactElement } from "react";
import { FernTooltip } from "./FernTooltip";

type ChipProps = {
    name: string;
    description: string | null | undefined;
    small?: boolean;
};

export const Chip = ({ name, description = undefined, small }: ChipProps): ReactElement => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(name);
    return (
        <FernTooltip
            open={wasJustCopied ? true : description == null ? false : undefined}
            content={wasJustCopied ? "Copied!" : description}
        >
            <span
                className={classNames(
                    "t-default bg-tag-default hover:bg-tag-default-hover cursor-default font-mono text-xs flex items-center",
                    {
                        ["py-1 px-1.5 rounded-md h-5"]: small,
                        ["py-1 px-2 rounded-lg h-6"]: !small,
                    },
                )}
                onClick={copyToClipboard}
            >
                <span>{name}</span>
            </span>
        </FernTooltip>
    );
};
