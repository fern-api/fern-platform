import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { execa } from "execa";

export async function execFernCli(command: string, cwd?: string): Promise<void> {
    const commandParts = command.split(" ");
    try {
        // Running the commands on Lambdas is a bit odd...specifically you can only write to tmp on a lambda
        // so here we make sure the CLI is bundled via the `external` block in serverless.yml
        // and then execute the command directly via node_modules, with the home and cache set to /tmp.
        process.env.NPM_CONFIG_CACHE = "/tmp/.npm";
        process.env.HOME = "/tmp";

        let command;
        // If you don't have node_modules/fern-api, try using the CLI directly
        if (!(await doesPathExist(AbsoluteFilePath.of(`${process.cwd()}/node_modules/fern-api`)))) {
            command = execa("fern", commandParts, {
                cwd,
            });
        } else {
            command = execa(`${process.cwd()}/node_modules/fern-api/cli.cjs`, commandParts, {
                cwd,
            });
        }
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
        await command;
    } catch (error) {
        console.error(`\`fern api update\` failed. stderr: ${error.stderr} (${error.exitCode})`);
        throw error;
    }
}
