import { openapiAtom, store } from "../../atoms";
import { CommandHandler, CommandProps } from "../types";
import { callInstall } from "./install";

export const call: CommandHandler = async (props: CommandProps) => {
    const args = props.argv.slice(1);

    const command = args[0];

    if (command === "install") {
        return callInstall(props, args[1]);
    }

    const specs = store.get(openapiAtom);

    const spec = command ? specs[command] : undefined;

    if (spec) {
        props.stdout.write(`${JSON.stringify(spec, null, 2)}\n`);
        return 0;
    }

    if (command && !spec) {
        props.stderr.write(`Unknown subcommand: ${command}\n`);
    }

    const options = Object.keys(specs);
    props.stderr.write(`options: ${["install", ...options].join(", ")}\r\n`);

    return 1;
};
