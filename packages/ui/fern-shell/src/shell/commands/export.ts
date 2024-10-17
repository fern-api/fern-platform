import { parseArgv } from "../parseArgv";
import { CommandHandler, CommandProps } from "./types";

export const export_: CommandHandler = (props: CommandProps) => {
    return new Promise((resolve) => {
        props.argv.slice(1).forEach((arg) => {
            const [key, value] = arg.split("=");
            props.env.set(key, parseArgv(value).join(" "));
        });
        resolve(0);
    });
};
