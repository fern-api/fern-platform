import { openapiAtom, store } from "../../atoms";
import { CommandHandler, CommandProps } from "../types";
import { callInstall, options } from "./install";
import { runCall } from "./runner";

export const call: CommandHandler = {
    handler: async (props: CommandProps) => {
        const args = props.argv.slice(1);

        const command = args[0];

        if (command === "install") {
            return callInstall(props, args[1]);
        }

        const specs = store.get(openapiAtom);

        const spec = command ? specs[command] : undefined;

        if (spec) {
            if (args.length > 1) {
                return runCall(props, spec, args.slice(1));
            }

            props.stdout.write(`${JSON.stringify(spec, null, 2)}\n`);
            return 0;
        }

        if (command && !spec) {
            props.stderr.write(`Unknown subcommand: ${command}\n`);
        }

        const options = Object.keys(specs);
        props.stderr.write(`options: ${["install", ...options].join(", ")}\r\n`);

        return 1;
    },
    completions: async (argv: string[]): Promise<string[]> => {
        const [command, ...args] = argv;

        if (command !== "call") {
            return [];
        }

        if (args.length === 0) {
            return ["install", ...Object.keys(store.get(openapiAtom))];
        }

        if (args.length === 1 && args[0] === "install") {
            return Object.keys(options);
        }

        return [];
    },
};
