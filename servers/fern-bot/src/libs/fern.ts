import { execa, Result } from "execa";
import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import tmp from "tmp-promise";
import { doesPathExist } from "./fs";

export async function execFernCli(command: string, cwd?: string, pipeYes: boolean = false): Promise<Result> {
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

        let command: Promise<Result>;
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
        return await command;
    } catch (error) {
        console.error("fern command failed.");
        throw error;
    }
}

// We pollute stdout with a version upgrade log, this tries to ignore that by only consuming the first line
// Exported to leverage in tests
export function cleanFernStdout(stdout: string): string {
    return stdout.split("╭─")[0]?.split("\n")[0]?.trim() ?? "";
}

// This type is meant to mirror the data model for the `generator list` command
// defined in the OSS repo.
type GeneratorList = Record<string, Record<string, string[]>>;
export const NO_API_FALLBACK_KEY = "NO_API_FALLBACK";
export async function getGenerators(fullRepoPath: string): Promise<GeneratorList> {
    const tmpDir = await tmp.dir();
    const outputPath = `${tmpDir.path}/gen_list.yml`;
    await execFernCli(`generator list --api-fallback ${NO_API_FALLBACK_KEY} -o ${outputPath}`, fullRepoPath);

    const data = await readFile(outputPath, "utf-8");

    return yaml.load(data) as GeneratorList;
}

// Searches for a `fern.config.json` files within the repo, and returns the paths to them
export async function findFernWorkspaces(fullRepoPath: string): Promise<string[]> {
    async function searchDirectory(dir: string): Promise<string[]> {
        const entries = await readdir(dir, { withFileTypes: true });
        const results: string[] = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results.push(...(await searchDirectory(fullPath)));
            } else if (entry.name === "fern.config.json") {
                results.push(path.dirname(fullPath));
            }
        }

        return results;
    }

    return searchDirectory(fullRepoPath);
}
