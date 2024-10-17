import { parseArgv } from "../parseArgv";
import { CommandHandler, CommandProps } from "./types";

export const export_: CommandHandler = (props: CommandProps) => {
    return new Promise((resolve) => {
        props.argv.slice(1).forEach((arg) => {
            const [key, value] = arg.split("=");
            if (!key || !value) {
                props.stderr.write(`export: ${arg}: not a valid argument\r\n`);
                resolve(1);
                return;
            }
            props.env.set(key, parseArgv(value).join(" "));
        });
        resolve(0);
    });
};
