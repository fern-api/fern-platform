import { CommandHandler, CommandProps } from "./types";

export const echo: CommandHandler = (props: CommandProps) => {
    return new Promise(async (resolve) => {
        const out = props.argv
            .slice(1)
            .map((arg) => {
                if (arg.startsWith("$") && arg.length > 1) {
                    return props.env.get(arg.slice(1)) ?? "";
                }
                return arg;
            })
            .join(" ");
        props.stdout.write(out);
        props.stderr.write("\r\n");
        resolve(0);
    });
};
