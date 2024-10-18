import { OpenAPI3 } from "openapi-typescript";
import { CommandProps } from "../types";

export async function runCall(props: CommandProps, spec: OpenAPI3, _args: string[]): Promise<number> {
    if (spec.paths == null || Object.keys(spec.paths).length === 0) {
        props.stderr.write("No paths found in spec\n");
        return 1;
    }

    return 0;
}
