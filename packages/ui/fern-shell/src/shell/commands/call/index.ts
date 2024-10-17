import { CommandHandler, CommandProps } from "../types";
import { callInstall } from "./install";

export const call: CommandHandler = async (props: CommandProps) => {
    const args = props.argv.slice(1);

    if (args[0] === "install") {
        return callInstall(props);
    }

    props.stderr.write(`fern-shell: call: command not found: ${args[0]}\n`);

    return 0;
};
