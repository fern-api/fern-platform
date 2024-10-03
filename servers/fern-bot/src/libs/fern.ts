import execa from "execa";
import tmp from "tmp-promise";
import { doesPathExist } from "./fs";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

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

export function getQualifiedGeneratorName({
    generatorName,
    groupName,
    apiName,
}: {
    generatorName: string;
    groupName: string;
    apiName: string | undefined;
}): string {
    let additionalName = groupName;
    if (apiName != null && apiName !== NO_API_FALLBACK_KEY) {
        additionalName = `${apiName}/${groupName}`;
    }
    return `${generatorName.replace("fernapi/", "")}@${additionalName}`;
}

export async function getOrganzation(fullRepoPath: string): Promise<string | undefined> {
    try {
        return cleanFernStdout((await execFernCli("organization", fullRepoPath)).stdout);
    } catch (error) {
        console.error(
            "Could not determine the repo owner, continuing to upgrade CLI, but will fail generator upgrades.",
        );
        return;
    }
}

export async function isOrganizationCanary(orgId: string, venusUrl: string): Promise<boolean> {
    const client = new FernVenusApiClient({ environment: venusUrl });

    const response = await client.organization.get(FernVenusApi.OrganizationId(orgId));
    console.log(`Organization response: ${JSON.stringify(response)}, orgId: ${orgId}.`);
    if (!response.ok) {
        throw new Error(`Organization ${orgId} not found`);
    }

    return response.body.isFernbotCanary;
}
