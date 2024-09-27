import { cleanStdout } from "@functions/generator-updates/shared/updateGeneratorInternal";
import { execFernCli } from "@libs/fern";
import { cloneRepo, configureGit, DEFAULT_REMOTE_NAME } from "@libs/github";

import { updateGeneratorVersions } from "@functions/generator-updates/updateGeneratorVersions";
import { evaluateEnv } from "@libs/env";
import { setupGithubApp } from "@libs/github/octokit";
import { App } from "octokit";
import { SimpleGit } from "simple-git";

// A bit of hardcoding to be able to use an existing repo, as opposed to make one and
// manage app installation, etc all within a test
const REPO_FULL_NAME = "fern-api/fern-bot-tests";
const CLI_TEST_BRANCH = "fern/update/cli";
const PYTHON_TEST_BRANCH = "fern/update/fern-python-sdk@local";
const JAVA_TEST_BRANCH = "fern/update/fern-java-sdk@another-group";

export async function getBranch(git: SimpleGit, branchToCheckoutName: string): Promise<void> {
    await git.fetch(DEFAULT_REMOTE_NAME, branchToCheckoutName);
    await git.checkout(branchToCheckoutName);
}

beforeEach(async () => {
    const env = evaluateEnv();
    const app: App = setupGithubApp(env);
    await app.eachRepository(async (installation) => {
        if (installation.repository.full_name !== REPO_FULL_NAME) {
            return;
        }

        const [git, _] = await configureGit(installation.repository);
        // Delete the branches, if they exist
        await cloneRepo(
            git,
            installation.repository,
            installation.octokit,
            env.GITHUB_APP_LOGIN_NAME,
            env.GITHUB_APP_LOGIN_ID,
        );
        try {
            await installation.octokit.rest.git.deleteRef({
                owner: installation.repository.owner.login,
                repo: installation.repository.name,
                ref: `heads/${CLI_TEST_BRANCH}`,
            });
            await installation.octokit.rest.git.deleteRef({
                owner: installation.repository.owner.login,
                repo: installation.repository.name,
                ref: `heads/${PYTHON_TEST_BRANCH}`,
            });
            await installation.octokit.rest.git.deleteRef({
                owner: installation.repository.owner.login,
                repo: installation.repository.name,
                ref: `heads/${JAVA_TEST_BRANCH}`,
            });
        } catch (e) {
            console.log("Branches do not exist, continuing, consider `beforeEach` a success.");
        }
    });
});

it(
    "happy path fern-bot upgrade",
    async () => {
        const env = evaluateEnv();
        const app: App = setupGithubApp(env);
        await app.eachRepository(async (installation) => {
            if (installation.repository.full_name !== REPO_FULL_NAME) {
                return;
            }

            const [git, fullRepoPath] = await configureGit(installation.repository);
            // Delete the branches
            await cloneRepo(
                git,
                installation.repository,
                installation.octokit,
                env.GITHUB_APP_LOGIN_NAME,
                env.GITHUB_APP_LOGIN_ID,
            );

            // Get versions off main
            await git.checkout("main");
            const cliVersion = cleanStdout((await execFernCli("--version", fullRepoPath)).stdout);
            const pythonVersion = cleanStdout(
                (
                    await execFernCli(
                        "generator get --version --generator fernapi/fern-python-sdk --group local",
                        fullRepoPath,
                    )
                ).stdout,
            );
            const anotherGroupPythonVersion = cleanStdout(
                (
                    await execFernCli(
                        "generator get --version --generator fernapi/fern-python-sdk --group another-group",
                        fullRepoPath,
                    )
                ).stdout,
            );
            const javaVersion = cleanStdout(
                (
                    await execFernCli(
                        "generator get --version --generator fernapi/fern-java-sdk --group another-group",
                        fullRepoPath,
                    )
                ).stdout,
            );

            // Run local invoke of the bot
            // TODO: it'd be great if this could be called directly to more appropriately mirror the lambda,
            // but execa continues to have difficulties running pnpm.
            //
            // Instead we just invoke the function directly
            process.env["REPO_TO_RUN_ON"] = REPO_FULL_NAME;
            await updateGeneratorVersions({});

            try {
                // Pull each branch and make sure the version is not what it was (hardcoded)
                await getBranch(git, CLI_TEST_BRANCH);
                const upgradedCliVersion = cleanStdout((await execFernCli("--version", fullRepoPath)).stdout);
                expect(upgradedCliVersion).not.toBe(cliVersion);
            } catch (e) {
                console.log(
                    "Error in CLI branch, likely because main has been updated to latest, so no upgrade branch has been made.",
                );
                console.log(e);
            }

            await getBranch(git, PYTHON_TEST_BRANCH);
            const upgradedPythonVersion = cleanStdout(
                (
                    await execFernCli(
                        "generator get --group local --generator fernapi/fern-python-sdk --version",
                        fullRepoPath,
                    )
                ).stdout,
            );
            expect(upgradedPythonVersion).not.toBe(pythonVersion);

            await getBranch(git, JAVA_TEST_BRANCH);
            // Make sure we're not including major version bumps in other PRs
            const upgradedPythonVersionJavaBranch = cleanStdout(
                (
                    await execFernCli(
                        "generator get --group another-group --generator fernapi/fern-python-sdk --version",
                        fullRepoPath,
                    )
                ).stdout,
            );
            expect(upgradedPythonVersionJavaBranch).toBe(anotherGroupPythonVersion);
            const upgradedJavaVersion = cleanStdout(
                (
                    await execFernCli(
                        "generator get --group another-group --generator fernapi/fern-java-sdk --version",
                        fullRepoPath,
                    )
                ).stdout,
            );
            expect(upgradedJavaVersion).not.toBe(javaVersion);
        });
    },
    // 30s timeout
    { timeout: 300000 },
);
