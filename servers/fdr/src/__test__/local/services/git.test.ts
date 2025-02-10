import { FdrAPI } from "@fern-api/fdr-sdk";
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
    url: FdrAPI.Url("repository.html_url"),
    repositoryOwnerOrganizationId: FdrAPI.OrgId("organizationId"),
    defaultBranchChecks: [],
  });

  const registeredRepo = getAPIResponse(
    await fdr.git.getRepository("owner", "name")
  );

  expect(registeredRepo.id).toEqual({
    type: "github",
    id: "test",
  });
});
