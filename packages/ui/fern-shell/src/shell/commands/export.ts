import stringArgv from "string-argv";
import { CommandHandler, CommandProps } from "./types";

export const export_: CommandHandler = (props: CommandProps) => {
    return new Promise((resolve) => {
        props.argv.forEach((arg) => {
            const [key, value] = arg.split("=");
            props.env.set(key, stringArgv(value).join(" "));
        });
        resolve(0);
    });
};
