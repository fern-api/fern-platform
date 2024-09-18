import { FernRepository } from "@fern-api/fdr-sdk/src/client/generated/api";
import { PullRequest, PullRequestState } from "../../../api/generated/api";
import { createMockFdrApplication } from "../../mock";

const fdrApplication = createMockFdrApplication({
    orgIds: ["acme", "octoai"],
});

it("repo happy path", async () => {
    const repo1: FernRepository = {
        type: "sdk",
        id: { type: "github", id: "acme-123" },
        name: "repo1",
        owner: "acme",
        fullName: "acme/repo1",
        repositoryOwnerOrganizationId: "acme",
        url: "https://123.com",
        defaultBranchChecks: [],
        sdkLanguage: "python",
    };
    await fdrApplication.dao.git().upsertRepository({ repository: repo1 });

    const repo2: FernRepository = {
        type: "config",
        id: { type: "github", id: "octo-123" },
        name: "repo1",
        owner: "octoai",
        fullName: "octoai/repo1",
        repositoryOwnerOrganizationId: "octoai",
        url: "https://123.com",
        defaultBranchChecks: [],
    };
    await fdrApplication.dao.git().upsertRepository({ repository: repo2 });

    const repos = await fdrApplication.dao.git().listRepository({
        repositoryName: undefined,
        repositoryOwner: undefined,
        organizationId: undefined,
    });
    expect(repos.repositories).toEqual([repo1, repo2]);

    const repo1FromDb = await fdrApplication.dao
        .git()
        .getRepository({ repositoryOwner: "acme", repositoryName: "repo1" });
    expect(repo1FromDb).toEqual(repo1);
});

it("pulls happy path", async () => {
    const repository: FernRepository = {
        type: "sdk",
        id: { type: "github", id: "12345" },
        name: "repoForPRs",
        owner: "acme",
        fullName: "acme/repoForPRs",
        repositoryOwnerOrganizationId: "acme",
        url: "https://123.com",
        defaultBranchChecks: [],
        sdkLanguage: "python",
    };
    await fdrApplication.dao.git().upsertRepository({ repository });

    const pull1: PullRequest = {
        pullRequestNumber: 1,
        repositoryOwner: "acme",
        repositoryName: "repoForPRs",
        author: {
            name: "Armando",
            email: "armando@buildwithfern.com",
            username: "armando",
        },
        reviewers: [],
        title: "PR 1",
        url: "https://123.com",
        checks: [],
        state: PullRequestState.Open,
        createdAt: new Date().toISOString(),
    };
    await fdrApplication.dao.git().upsertPullRequest({ pullRequest: pull1 });

    const pull2: PullRequest = {
        pullRequestNumber: 2,
        repositoryOwner: "acme",
        repositoryName: "repoForPRs",
        author: {
            name: "Armando",
            email: "armando@buildwithfern.com",
            username: "armando",
        },
        reviewers: [],
        title: "PR 2",
        url: "https://123.com",
        checks: [],
        state: PullRequestState.Merged,
        createdAt: new Date().toISOString(),
        mergedAt: new Date().toISOString(),
    };
    await fdrApplication.dao.git().upsertPullRequest({ pullRequest: pull2 });

    const pulls = await fdrApplication.dao.git().listPullRequests({
        repositoryName: undefined,
        repositoryOwner: undefined,
        organizationId: undefined,
    });
    expect(pulls.pullRequests).toEqual([pull2, pull1]);

    const pull1FromDb = await fdrApplication.dao
        .git()
        .getPullRequest({ repositoryOwner: "acme", repositoryName: "repoForPRs", pullRequestNumber: 1 });
    expect(pull1FromDb).toEqual(pull1);
});
