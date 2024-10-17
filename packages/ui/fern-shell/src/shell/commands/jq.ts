import jsonpath from "jsonpath";
import { CommandHandler } from "./types";

export const jq: CommandHandler = async ({ argv, stdout, stderr }) => {
    let buffer = "";
    // while (true) {
    //     const result = await stdin.read();
    //     if (result.done) {
    //         break;
    //     }
    //     buffer += result.value;
    // }

    if (buffer.length === 0) {
        stderr.write("jq: no input\r\n");
        return 0;
    }

    try {
        const result = jsonpath.query(JSON.parse(buffer), argv[1] ?? "$");
        for (const item of result) {
            stdout.write(JSON.stringify(item, null, 2) + "\n");
        }
        return 0;
    } catch (err) {
        stderr.write(`jq: error: ${String(err)}\r\n`);
        return 1;
    }
};
