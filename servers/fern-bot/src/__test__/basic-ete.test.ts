import { deleteBranch } from "@fern-api/github";
import { cleanStdout } from "@functions/generator-updates/shared/updateGeneratorInternal";
import { execFernCli } from "@libs/fern";
import { configureGitRaw } from "@libs/github";
import execa from "execa";

// A bit of hardcoding to be able to use an existing repo, as opposed to make one and
// manage app installation, etc all within a test
const REPO_ID = "793531028";
const REPO_NAME = "fern-bot-tests";
const CLI_TEST_BRANCH = "fern/update/cli";
const PYTHON_TEST_BRANCH = "fern/update/fern-python-sdk@local";

beforeEach(async () => {
    const [git, _] = await configureGitRaw(REPO_ID, REPO_NAME);
    // Delete the branches
    await deleteBranch(git, CLI_TEST_BRANCH);
    await deleteBranch(git, PYTHON_TEST_BRANCH);
});

it("fern-api/docs-starter-openapi", async () => {
    // TODO: actually init SimpleGit
    const [git, fullRepoPath] = await configureGitRaw(REPO_ID, REPO_NAME);
    // Get versions off main
    await git.checkout("main");
    const cliVersion = cleanStdout((await execFernCli("--version", fullRepoPath)).stdout);
    const pythonVersion = cleanStdout(
        (await execFernCli(`generator get --version --generator "python-sdk" --group local`, fullRepoPath)).stdout,
    );
    // Run local invoke of the bot
    await execa("pnpm", ["invoke", "local", "--function", "updateGeneratorVersions", "--stage", "development"], {
        // Project root
        cwd: __dirname + "../../",
    });
    // Check that the PRs were created
    // Pull each branch and make sure the version is not what it was (hardcoded)
    await git.checkout(CLI_TEST_BRANCH);
    const upgradedCliVersion = cleanStdout((await execFernCli("--version", fullRepoPath)).stdout);
    expect(upgradedCliVersion).not.toBe(cliVersion);

    await git.checkout(PYTHON_TEST_BRANCH);
    const upgradedPythonVersion = cleanStdout((await execFernCli("--version", fullRepoPath)).stdout);
    expect(upgradedPythonVersion).not.toBe(pythonVersion);
});
