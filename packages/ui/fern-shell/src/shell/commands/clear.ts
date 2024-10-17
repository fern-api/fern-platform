import ansi from "ansi-escapes";
import { CommandHandler, CommandProps } from "./types";

export const clear: CommandHandler = (props: CommandProps) => {
    props.stderr.write(ansi.eraseScreen + ansi.cursorTo(0, 0));
    return Promise.resolve(0);
};
