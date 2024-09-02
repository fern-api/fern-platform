import { createOrUpdatePullRequest, getOrUpdateBranch } from "@fern-api/github";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { FernRegistryClient } from "@fern-fern/generators-sdk";
import { ChangelogResponse } from "@fern-fern/generators-sdk/api/resources/generators";
import { execFernCli } from "@libs/fern";
import { DEFAULT_REMOTE_NAME, cloneRepo, configureGit, type Repository } from "@libs/github/utilities";
import yaml from "js-yaml";
import { Octokit } from "octokit";
import { SimpleGit } from "simple-git";

async function isOrganizationCanary(venusUrl: string, fullRepoPath: string): Promise<boolean> {
    const orgId = (await execFernCli("organization", fullRepoPath)).stdout;
    console.log(`Found organization ID: ${orgId}`);
    const client = new FernVenusApiClient({ environment: venusUrl });

    const response = await client.organization.get(FernVenusApi.OrganizationId(orgId));
    if (!response.ok) {
        throw new Error(`Organization ${orgId} not found`);
    }

    return response.body.isFernbotCanary;
}

async function getGeneratorChangelog(
    fdrUrl: string,
    generator: string,
    from: string,
    to: string,
): Promise<ChangelogResponse[]> {
    const client = new FernRegistryClient({ environment: fdrUrl });

    const response = await client.generators.versions.getChangelog(generator, from, to);
    if (!response.ok) {
        throw new Error(`Changelog for generator ${generator} (from version: ${from} to: ${to}) not found`);
    }

    return response.body.entries;
}

async function getCliChangelog(fdrUrl: string, from: string, to: string): Promise<ChangelogResponse[]> {
    const client = new FernRegistryClient({ environment: fdrUrl });

    const response = await client.generators.cli.getChangelog(from, to);
    if (!response.ok) {
        throw new Error(`Changelog for CLI (from version: ${from} to: ${to}) not found`);
    }

    return response.body.entries;
}

// TODO: need to get the upgrade CLI to return the from and to versions
function formatChangelogResponses(changelog: ChangelogResponse[]): string {
    // TODO: actually format these
    // The format is effectively the below, where sections are only included if there is at
    // least one entry in that section, and we try to cap the number of entries in each section to ~5
    // ## [<Lowest Version> - <Highest Version>] - Changelog
    // ### Added:
    // - <entry>
    // ### Changed:
    // - <entry>
    // ### Removed:
    // - <entry>
    // ### Fixed:
    // - <entry>
    // ### Deprecated:
    // - <entry>
    // ### Security:
    // - <entry>
    // TODO: populate these arrays
    const added: string[] = [];
    const changed: string[] = [];
    const removed: string[] = [];
    const fixed: string[] = [];
    const deprecated: string[] = [];
    const security: string[] = [];

    let prBody = `## [${changelog[0].version} - ${changelog[changelog.length - 1].version}] - Changelog\n\n`;
    let addedChanges = false;
    if (added.length > 0) {
        prBody += "### Added:\n";
        prBody += added.map((entry) => `- ${entry}`).join("\n");
        prBody += "\n";
        addedChanges = true;
    }
    if (changed.length > 0) {
        prBody += "### Changed:\n";
        prBody += changed.map((entry) => `- ${entry}`).join("\n");
        prBody += "\n";
        addedChanges = true;
    }
    if (removed.length > 0) {
        prBody += "### Removed:\n";
        prBody += removed.map((entry) => `- ${entry}`).join("\n");
        prBody += "\n";
        addedChanges = true;
    }
    if (fixed.length > 0) {
        prBody += "### Fixed:\n";
        prBody += fixed.map((entry) => `- ${entry}`).join("\n");
        prBody += "\n";
        addedChanges = true;
    }
    if (deprecated.length > 0) {
        prBody += "### Deprecated:\n";
        prBody += deprecated.map((entry) => `- ${entry}`).join("\n");
        prBody += "\n";
        addedChanges = true;
    }
    if (security.length > 0) {
        prBody += "### Security:\n";
        prBody += security.map((entry) => `- ${entry}`).join("\n");
        prBody += "\n";
        addedChanges = true;
    }

    if (!addedChanges) {
        prBody += "No changes found.";
    }

    return prBody;
}

// This type is meant to mirror the data model for the `generator list` command
// defined in the OSS repo.
type GeneratorList = Record<string, Record<string, string[]>>;
const NO_API_FALLBACK_KEY = "NO_API_FALLBACK";
async function getGenerators(fullRepoPath: string): Promise<GeneratorList> {
    const response = await execFernCli(`generator list --api-fallback ${NO_API_FALLBACK_KEY}`, fullRepoPath);

    return yaml.load(response.stdout) as GeneratorList;
}

export async function updateVersionInternal(
    octokit: Octokit,
    repository: Repository,
    fernBotLoginName: string,
    fernBotLoginId: string,
    venusUrl: string,
    fdrUrl: string,
): Promise<void> {
    const [git, fullRepoPath] = await configureGit(repository);
    console.log(`Cloning repo: ${repository.clone_url} to ${fullRepoPath}`);
    await cloneRepo(git, repository, octokit, fernBotLoginName, fernBotLoginId);

    try {
        if (!(await isOrganizationCanary(venusUrl, fullRepoPath))) {
            console.log("Organization is not a fern-bot canary, skipping upgrade.");
            return;
        }
    } catch (error) {
        console.error("Could not determine if the repo owner was a fern-bot canary, quitting:", error);
        return;
    }

    try {
        await updateSingleEntity({
            octokit,
            repository,
            git,
            branchName: "fern/update/cli",
            prTitle: "Upgrade Fern CLI version",
            upgradeAction: async () => {
                const response = await execFernCli("upgrade", fullRepoPath);
                console.log(response.stdout);
                console.log(response.stderr);
            },
            getPRBody: async (fromVersion, toVersion) => {
                return formatChangelogResponses(await getCliChangelog(fdrUrl, fromVersion, toVersion));
            },
            getEntityVersion: async () => {
                return (await execFernCli("--version", fullRepoPath)).stdout;
            },
        });

        // Pull a branch of fern/update/<api>/<group>/<generator>
        // as well as fern/update/cli
        const generatorUpdates: Promise<void>[] = [];
        const generatorsList = await getGenerators(fullRepoPath);
        for (const [apiName, api] of Object.entries(generatorsList)) {
            for (const [groupName, group] of Object.entries(api)) {
                for (const generator of group) {
                    const branchName = "fern/update/";
                    let additionalName = "";
                    if (apiName !== NO_API_FALLBACK_KEY) {
                        additionalName += `${apiName}/`;
                    }
                    additionalName += `${groupName}/${generator}`;

                    generatorUpdates.push(
                        updateSingleEntity({
                            octokit,
                            repository,
                            git,
                            branchName: `${branchName}${additionalName}`,
                            prTitle: `Upgrade Fern Generator Version: (${additionalName})`,
                            upgradeAction: async () => {
                                let command = `generator upgrade --generator ${generator} --group ${groupName}`;
                                if (apiName !== NO_API_FALLBACK_KEY) {
                                    command += ` --api ${apiName}`;
                                }
                                const response = await execFernCli(command, fullRepoPath);
                                console.log(response.stdout);
                                console.log(response.stderr);
                            },
                            getPRBody: async (fromVersion, toVersion) => {
                                return formatChangelogResponses(
                                    await getGeneratorChangelog(fdrUrl, generator, fromVersion, toVersion),
                                );
                            },
                            getEntityVersion: async () => {
                                let command = `generator get --version --generator ${generator} --group ${groupName}`;
                                if (apiName !== NO_API_FALLBACK_KEY) {
                                    command += ` --api ${apiName}`;
                                }
                                return (await execFernCli(command, fullRepoPath)).stdout;
                            },
                        }),
                    );
                }
            }
        }

        await Promise.all(generatorUpdates);
    } catch (error) {
        console.error("Error running fern CLI upgrade:", error);
        return;
    }
}

async function updateSingleEntity({
    octokit,
    repository,
    git,
    branchName,
    prTitle,
    upgradeAction,
    getPRBody,
    getEntityVersion,
}: {
    octokit: Octokit;
    repository: Repository;
    git: SimpleGit;
    branchName: string;
    prTitle: string;
    upgradeAction: () => Promise<void>;
    getPRBody: (fromVersion: string, toversion: string) => Promise<string>;
    getEntityVersion: () => Promise<string>;
}): Promise<void> {
    const originDefaultBranch = `${DEFAULT_REMOTE_NAME}/${repository.default_branch}`;

    await getOrUpdateBranch(git, originDefaultBranch, branchName);

    const fromVersion = await getEntityVersion();
    await upgradeAction();
    const toVersion = await getEntityVersion();

    console.log("Checking for changes to commit and push");
    if (!(await git.status()).isClean()) {
        console.log("Changes detected, committing and pushing");
        // Add + commit files
        await git.add(["-A"]);
        // TODO: use AI to generate commit messages from the changelog
        await git.commit("(chore): upgrade generator versions to latest");

        // Push the changes
        await git.push(["--force-with-lease", DEFAULT_REMOTE_NAME, `${branchName}:refs/heads/${branchName}`]);

        // Open a PR
        await createOrUpdatePullRequest(
            octokit,
            {
                title: `:herb: :sparkles: [Scheduled] ${prTitle}`,
                base: "main",
                body: await getPRBody(fromVersion, toVersion),
            },
            repository.full_name,
            repository.full_name,
            branchName,
        );
    } else {
        console.log("No changes detected, skipping PR creation");
    }
}
