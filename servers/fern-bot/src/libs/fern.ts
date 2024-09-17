import execa from "execa";
import tmp from "tmp-promise";
import { doesPathExist } from "./fs";

export async function execFernCli(
    command: string,
    cwd?: string,
    pipeYes: boolean = false,
): Promise<execa.ExecaChildProcess<string>> {
    console.log(`Running command on fern CLI: ${command}`);
    const commandParts = command.split(" ");
    try {
        // Running the commands on Lambdas is a bit odd...specifically you can only write to tmp on a lambda
        // so here we make sure the CLI is bundled via the `external` block in serverless.yml
        // and then execute the command directly via node_modules, with the home and cache set to /tmp.
        const tmpDir = await tmp.dir();
        const tmpDirPath = tmpDir.path;
        process.env.NPM_CONFIG_CACHE = `${tmpDirPath}/.npm`;
        process.env.HOME = tmpDirPath;

        // Update config to allow `npm install` to work from within the `fern upgrade` command
        process.env.NPM_CONFIG_PREFIX = tmpDirPath;
        // Re-install the CLI to ensure it's at the correct path, given the updated config
        await execa("npm", ["install", "-g", "fern-api"]);

        let command: execa.ExecaChildProcess<string>;
        // If you don't have node_modules/fern-api, try using the CLI directly
        if (!(await doesPathExist(`${process.cwd()}/node_modules/fern-api`))) {
            // TODO: is there a better way to pipe `yes`? Piping the output of the real `yes` command doesn't work -- resulting in an EPIPE error.
            command = execa("fern", commandParts, {
                cwd,
                input: pipeYes ? "y" : undefined,
            });
        } else {
            command = execa(`${process.cwd()}/node_modules/fern-api/cli.cjs`, commandParts, {
                cwd,
                input: pipeYes ? "y" : undefined,
            });
        }
        return command;
    } catch (error) {
        console.error("fern command failed.");
        throw error;
    }
}

// We pollute stdout with a version upgrade log, this tries to ignore that by only consuming the first line
// Exported to leverage in tests
export function cleanFernStdout(stdout: string): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return stdout.split("╭─")[0]!.split("\n")[0]!.trim();
}
