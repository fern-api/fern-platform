import { CommandHandler, CommandProps } from "./types";

export const echo: CommandHandler = (props: CommandProps) => {
    return new Promise(async (resolve) => {
        props.stdout.write(
            props.argv
                .map((arg) => {
                    if (arg.startsWith("$") && arg.length > 1) {
                        return props.env.get(arg.slice(1)) ?? "";
                    }
                    return arg;
                })
                .join(" "),
        );
        await props.stderr.write("\r\n");
        resolve(0);
    });
};
