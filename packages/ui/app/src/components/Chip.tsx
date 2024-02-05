import { Tooltip } from "@blueprintjs/core";
import { ReactElement } from "react";

type ChipProps = {
    name: string;
    description: string | undefined;
};

//Consider using Tailwind/Flowbite to create custom tooltips
//Docs: https://flowbite.com/docs/components/tooltips/
export const Chip = ({ name, description = undefined }: ChipProps): ReactElement => {
    return (
        <span className="border-default t-default bg-tag-default rounded border px-1.5 py-0.5 text-xs">
            <Tooltip disabled={description == null} content={description}>
                {name}
            </Tooltip>
        </span>
    );
};
