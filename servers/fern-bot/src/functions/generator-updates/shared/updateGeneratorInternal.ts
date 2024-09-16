import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { FernRegistryClient } from "@fern-fern/generators-sdk";
import { ChangelogResponse } from "@fern-fern/generators-sdk/api/resources/generators";
import { createOrUpdatePullRequest, getOrUpdateBranch } from "@fern-platform/github";
import { execFernCli } from "@libs/fern";
import { DEFAULT_REMOTE_NAME, cloneRepo, configureGit, type Repository } from "@libs/github/utilities";
import { GeneratorMessageMetadata, SlackService } from "@libs/slack/SlackService";
import yaml from "js-yaml";
import { Octokit } from "octokit";
import SemVer from "semver";
import { SimpleGit } from "simple-git";

async function isOrganizationCanary(orgId: string, venusUrl: string): Promise<boolean> {
    const client = new FernVenusApiClient({ environment: venusUrl });

    const response = await client.organization.get(FernVenusApi.OrganizationId(orgId));
    console.log(`Organization response: ${JSON.stringify(response)}, orgId: ${orgId}.`);
    if (!response.ok) {
        throw new Error(`Organization ${orgId} not found`);
    }

    return response.body.isFernbotCanary;
}

async function getGeneratorChangelog(
    fdrUrl: string,
    generatorId: string,
    from: string,
    to: string,
): Promise<ChangelogResponse[]> {
    console.log(`Getting changelog for generator ${generatorId} from ${from} to ${to}.`);
    const client = new FernRegistryClient({ environment: fdrUrl });

    const response = await client.generators.versions.getChangelog(generatorId, {
        fromVersion: { type: "exclusive", value: from },
        toVersion: { type: "inclusive", value: to },
    });
    if (!response.ok) {
        throw new Error(`Changelog for generator ${generatorId} (from version: ${from} to: ${to}) not found`);
    }

    return response.body.entries;
}

async function getCliChangelog(fdrUrl: string, from: string, to: string): Promise<ChangelogResponse[]> {
    console.log(`Getting changelog for CLI from ${from} to ${to}`);
    const client = new FernRegistryClient({ environment: fdrUrl });

    const response = await client.generators.cli.getChangelog({
        fromVersion: { type: "exclusive", value: from },
        toVersion: { type: "inclusive", value: to },
    });
    if (!response.ok) {
        throw new Error(
            `Changelog for CLI (from version: ${from} to: ${to}) not found: ${JSON.stringify(response)} from url ${fdrUrl}`,
        );
    }

    console.log("Changelog response: ", JSON.stringify(response.body));

    return response.body.entries;
}

function formatChangelogEntry(changelog: ChangelogResponse): string {
    let entry = "";
    entry += `\n<strong><code>${changelog.version}</code></strong>\n`;
    entry += changelog.changelogEntry
        .map((cle) => `<li>\n\n<code>${cle.type}:</code> ${cle.summary}\n</li>`)
        .join("\n\n");
    entry += "\n";

    return entry;
}

function formatChangelogResponses(previousVersion: string, changelogs: ChangelogResponse[]): string {
    // The format is effectively the below, where sections are only included if there is at
    // least one entry in that section, and we try to cap the number of entries in each section to ~5 with a see more
    // ## Upgrading from `<previous version>` to `<new version>` - Changelog
    // **`x.y.z`**
    // - `fix:` <summary>
    // **`x.y.z-rc0`**
    // - `feat:` <summary>
    // ...
    // > N additional updates, see more

    if (changelogs.length === 0) {
        throw new Error("Version difference was found, but no changelog entries were found. This is unexpected.");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const prBodyTitle = `## Upgrading from \`${previousVersion}\` to \`${changelogs[0]!.version}\` - Changelog\n\n<dl>\n<dd>\n<ul>`;
    let prBody = "";

    // Get the first 5 changelogs
    for (const changelog of changelogs.slice(0, 5)) {
        prBody += formatChangelogEntry(changelog);
    }

    if (changelogs.length > 5) {
        const numChangelogsLeft = changelogs.length - 5;
        prBody += `<details>\n\t<summary><strong>${numChangelogsLeft} additional update${numChangelogsLeft > 1 ? "s" : ""}</strong>, see more</summary>\n\n<br/>\n\n`;

        for (const changelog of changelogs.slice(5)) {
            prBody += "\t";
            prBody += formatChangelogEntry(changelog);
        }
        prBody += "</details>";
    }
    return prBodyTitle + prBody + "</ul>\n</dd>\n</dl>";
}

// This type is meant to mirror the data model for the `generator list` command
// defined in the OSS repo.
type GeneratorList = Record<string, Record<string, string[]>>;
const NO_API_FALLBACK_KEY = "NO_API_FALLBACK";
async function getGenerators(fullRepoPath: string): Promise<GeneratorList> {
    // Note since this is multi-line, we do not call `cleanStdout` on it, but it should be parsed ok.
    const response = await execFernCli(`generator list --api-fallback ${NO_API_FALLBACK_KEY}`, fullRepoPath);

    return yaml.load(response.stdout) as GeneratorList;
}

// We pollute stdout with a version upgrade log, this tries to ignore that by only consuming the first line
// Exported to leverage in tests
export function cleanStdout(stdout: string): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return stdout.split("╭─")[0]!.split("\n")[0]!.trim();
}

export async function updateVersionInternal(
    octokit: Octokit,
    repository: Repository,
    fernBotLoginName: string,
    fernBotLoginId: string,
    venusUrl: string,
    fdrUrl: string,
    slackToken: string,
    slackChannel: string,
): Promise<void> {
    const [git, fullRepoPath] = await configureGit(repository);
    console.log(`Cloning repo: ${repository.clone_url} to ${fullRepoPath}`);
    await cloneRepo(git, repository, octokit, fernBotLoginName, fernBotLoginId);

    const slackClient = new SlackService(slackToken, slackChannel);

    let maybeOrganization: string | undefined;
    try {
        maybeOrganization = cleanStdout((await execFernCli("organization", fullRepoPath)).stdout);
        console.log(`Found organization ID: ${maybeOrganization}`);
    } catch (_error) {
        console.error(
            "Could not determine the repo owner, continuing to upgrade CLI, but will fail generator upgrades.",
        );
    }

    await handleSingleUpgrade({
        octokit,
        repository,
        git,
        branchName: "fern/update/cli",
        prTitle: "Upgrade Fern CLI",
        upgradeAction: async () => {
            // Here we have to pipe yes to get through interactive prompts in the CLI
            const response = await execFernCli("upgrade", fullRepoPath, true);
            console.log(response.stdout);
            console.log(response.stderr);
        },
        getPRBody: async (fromVersion, toVersion) => {
            return formatChangelogResponses(fromVersion, await getCliChangelog(fdrUrl, fromVersion, toVersion));
        },
        getEntityVersion: async () => {
            return cleanStdout((await execFernCli("--version", fullRepoPath)).stdout);
        },
        slackClient,
        maybeOrganization,
    });

    try {
        if (maybeOrganization == null) {
            throw new Error("No organization was found, quitting before generator upgrades.");
        } else if (!(await isOrganizationCanary(maybeOrganization, venusUrl))) {
            console.log("Organization is not a fern-bot canary, skipping upgrade.");
            return;
        }
    } catch (error) {
        console.error("Could not determine if the repo owner was a fern-bot canary, quitting.");
        throw error;
    }

    const client = new FernRegistryClient({ environment: fdrUrl });
    // Pull a branch of fern/update/<generator>/<api>:<group>
    // as well as fern/update/cli
    const generatorsList = await getGenerators(fullRepoPath);
    for (const [apiName, api] of Object.entries(generatorsList)) {
        for (const [groupName, group] of Object.entries(api)) {
            for (const generator of group) {
                const generatorName = cleanStdout(generator);
                const branchName = "fern/update/";
                let additionalName = groupName;
                if (apiName !== NO_API_FALLBACK_KEY) {
                    additionalName = `${apiName}/${groupName}`;
                }
                additionalName = `${generatorName.replace("fernapi/", "")}@${additionalName}`;

                const generatorResponse = await client.generators.getGeneratorByImage({ dockerImage: generator });
                if (!generatorResponse.ok || generatorResponse.body == null) {
                    throw new Error(`Generator ${generator} not found`);
                }
                const generatorEntity = generatorResponse.body;

                // We could collect the promises here and await them at the end, but there aren't many you'd parallelize,
                // and I think you'd outweigh that benefit by having to make several clones to manage the branches in isolation.
                await handleSingleUpgrade({
                    octokit,
                    repository,
                    git,
                    branchName: `${branchName}${additionalName}`,
                    prTitle: `Upgrade Fern ${generatorEntity.displayName} Generator: (\`${groupName}\`)`,
                    upgradeAction: async ({ includeMajor }: { includeMajor?: boolean }) => {
                        let command = `generator upgrade --generator ${generatorName} --group ${groupName}`;
                        if (apiName !== NO_API_FALLBACK_KEY) {
                            command += ` --api ${apiName}`;
                        }
                        if (includeMajor) {
                            command += " --include-major";
                        }
                        const response = await execFernCli(command, fullRepoPath);
                        console.log(response.stdout);
                        console.log(response.stderr);
                    },
                    getPRBody: async (fromVersion, toVersion) => {
                        return formatChangelogResponses(
                            fromVersion,
                            await getGeneratorChangelog(fdrUrl, generatorEntity.id, fromVersion, toVersion),
                        );
                    },
                    getEntityVersion: async () => {
                        let command = `generator get --version --generator ${generatorName} --group ${groupName}`;
                        if (apiName !== NO_API_FALLBACK_KEY) {
                            command += ` --api ${apiName}`;
                        }
                        return cleanStdout((await execFernCli(command, fullRepoPath)).stdout);
                    },
                    maybeGetGeneratorMetadata: async () => {
                        return {
                            group: groupName,
                            generatorName,
                            apiName: apiName !== NO_API_FALLBACK_KEY ? apiName : undefined,
                        };
                    },
                    slackClient,
                    maybeOrganization,
                });
            }
        }
    }
}

async function handleSingleUpgrade({
    octokit,
    repository,
    git,
    branchName,
    prTitle,
    upgradeAction,
    getPRBody,
    getEntityVersion,
    maybeGetGeneratorMetadata,
    slackClient,
    maybeOrganization,
}: {
    octokit: Octokit;
    repository: Repository;
    git: SimpleGit;
    branchName: string;
    prTitle: string;
    upgradeAction: ({ includeMajor }: { includeMajor?: boolean }) => Promise<void>;
    getPRBody: (fromVersion: string, toversion: string) => Promise<string>;
    getEntityVersion: () => Promise<string>;
    maybeGetGeneratorMetadata?: () => Promise<GeneratorMessageMetadata>;
    slackClient: SlackService;
    maybeOrganization: string | undefined;
}): Promise<void> {
    // Before we checkout a new branch, we need to ensure we have the current version off the default branch
    // Checkout the default branch and run the version command to get the current version
    await git.checkout(repository.default_branch);
    const fromVersion = await getEntityVersion();

    // Checkout an upgrade branch, if one exists, update it, otherwise create it
    const originDefaultBranch = `${DEFAULT_REMOTE_NAME}/${repository.default_branch}`;
    await getOrUpdateBranch(git, originDefaultBranch, branchName);

    // Perform the upgrade and get the new version you just upgraded to
    console.log(`Upgrading entity to latest version, from version: ${fromVersion}`);
    await upgradeAction({});
    const toVersion = await getEntityVersion();
    console.log(`Upgraded entity to latest version, to version: ${toVersion}`);

    console.log("Checking for changes to commit and push");
    if (!(await git.status()).isClean() && fromVersion !== toVersion) {
        console.log("Changes detected, committing and pushing");
        // Add + commit files
        await git.add(["-A"]);
        // TODO: use AI to generate commit messages from the changelog
        await git.commit("(chore): upgrade versions to latest");

        // Push the changes
        await git.push(["--force-with-lease", DEFAULT_REMOTE_NAME, `${branchName}:refs/heads/${branchName}`]);

        // Open a PR, or update it in place
        const prUrl = await createOrUpdatePullRequest(
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

        // Notify via slack that the upgrade PR was created
        await slackClient.notifyUpgradePRCreated({
            fromVersion,
            toVersion,
            prUrl,
            repoName: repository.full_name,
            generator: maybeGetGeneratorMetadata ? await maybeGetGeneratorMetadata() : undefined,
            maybeOrganization,
        });
        return;
    } else if (fromVersion === toVersion) {
        console.log("Versions were the same, let's see if there's a new version across major versions.");
        await upgradeAction({ includeMajor: true });
        const toVersion = await getEntityVersion();
        const parsedFrom = SemVer.parse(fromVersion);
        const parsedTo = SemVer.parse(toVersion);
        // Clean the branch back up, to remove any unstaged changes
        await git.reset(["--hard"]);

        if (parsedFrom == null || parsedTo == null) {
            console.log("An invalid version was found, quitting", fromVersion, toVersion);
            return;
        }
        if (parsedFrom.major < parsedTo.major) {
            slackClient.notifyMajorVersionUpgradeEncountered({
                repoUrl: repository.html_url,
                repoName: repository.full_name,
                currentVersion: fromVersion,
                maybeOrganization,
                generator: maybeGetGeneratorMetadata ? await maybeGetGeneratorMetadata() : undefined,
            });
            console.log("No change made as the upgrade is across major versions.");
            return;
        }
    }

    console.log("No changes detected, skipping PR creation");
}
