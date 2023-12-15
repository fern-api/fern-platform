import { Tooltip2 } from "@blueprintjs/popover2";
import { ReactElement } from "react";

type ChipProps = {
    name: string;
    description: string | undefined;
};

//Consider using Tailwind/Flowbite to create custom tooltips
//Docs: https://flowbite.com/docs/components/tooltips/
export const Chip = ({ name, description = undefined }: ChipProps): ReactElement => {
    return (
        <span className="border-default t-primary bg-tag-default rounded border px-1.5 py-0.5 text-xs">
            <Tooltip2 disabled={description == null} content={description}>
                {name}
            </Tooltip2>
        </span>
    );
};
