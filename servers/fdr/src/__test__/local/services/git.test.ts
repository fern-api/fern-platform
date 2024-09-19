import { inject } from "vitest";
import { getAPIResponse, getClient } from "../util";

it("register repo", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    await fdr.git.upsertRepository({
        type: "config",
        id: {
            type: "github",
            id: "test",
        },
        name: "name",
        owner: "owner",
        fullName: "repository.full_name",
        url: "repository.html_url",
        repositoryOwnerOrganizationId: "organizationId",
        defaultBranchChecks: [],
    });

    const registeredRepo = getAPIResponse(await fdr.git.getRepository("owner", "name"));

    expect(registeredRepo.id).toEqual({
        type: "github",
        id: "test",
    });
});
