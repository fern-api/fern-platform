import { Tooltip2 } from "@blueprintjs/popover2";

type ChipProps = {
    name: string;
    description: string | undefined;
};

export const Chip = ({ name, description = undefined }: ChipProps): JSX.Element => {
    return (
        <span className="border-default t-primary bg-tag-default rounded border px-1.5 py-0.5 text-xs font-normal">
            <Tooltip2 disabled={description == null} content={description}>
                {name}
            </Tooltip2>
        </span>
    );
};
