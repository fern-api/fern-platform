import { useCopyToClipboard } from "@fern-ui/react-commons";
import { ReactElement } from "react";
import { FernTooltip } from "./FernTooltip";

type ChipProps = {
    name: string;
    description: string | undefined;
};

//Consider using Tailwind/Flowbite to create custom tooltips
//Docs: https://flowbite.com/docs/components/tooltips/
export const Chip = ({ name, description = undefined }: ChipProps): ReactElement => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(name);
    return (
        <FernTooltip
            open={wasJustCopied ? true : description == null ? false : undefined}
            content={wasJustCopied ? "Copied!" : description}
        >
            <span
                className="t-default bg-tag-default hover:bg-tag-default-hover cursor-default rounded-md px-1.5 py-1 text-xs"
                onClick={copyToClipboard}
            >
                <span>{name}</span>
            </span>
        </FernTooltip>
    );
};
