import { openapiAtom, store } from "../../atoms";
import { CommandProps } from "../types";

export const callInstall = async (props: CommandProps) => {
    // const args = props.argv.slice(1);

    // if (args.length === 0) {
    //     props.stderr.write("fern-shell: call: install: missing operand\n");
    //     return 1;
    // }

    try {
        const openapi = await fetch("https://openapi.vercel.sh/").then((res) => res.json());

        store.set(openapiAtom, openapi);

        props.stdout.write("fern-shell: call: install: success\n");

        return 0;
    } catch (err) {
        props.stderr.write(`fern-shell: call: install: ${err}\n`);
        return 1;
    }
};
