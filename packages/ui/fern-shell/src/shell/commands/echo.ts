import { CommandHandler, CommandProps } from "./types";

export const echo: CommandHandler = {
    handler: async (props: CommandProps) => {
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
        return 0;
    },
};
