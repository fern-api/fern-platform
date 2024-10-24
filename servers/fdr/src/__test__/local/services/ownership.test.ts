import { DocsV1Write, FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { getClient } from "../util";

it("change domain ownership", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });

    const domain = `docs-${Math.random()}.fern.com`;

    // register docs
    await fdr.docs.v1.write.startDocsRegister({
        orgId: FdrAPI.OrgId("fern"),
        domain,
        filepaths: [DocsV1Write.FilePath("logo.png"), DocsV1Write.FilePath("guides/guide.mdx")],
    });

    const response = await fdr.docs.v2.write.transferOwnershipOfDomain({
        domain,
        toOrgId: FdrAPI.OrgId("acme"),
    });

    if (!response.ok) {
        throw new Error(`Failed to transfer ownership of domain: ${response.error}`);
    }
    expect(response.ok).toBe(true);

    // verify ownership
    const registerResponse = await fdr.docs.v1.write.startDocsRegister({
        orgId: FdrAPI.OrgId("acme"),
        domain,
        filepaths: [DocsV1Write.FilePath("logo.png"), DocsV1Write.FilePath("guides/guide.mdx")],
    });
    if (!registerResponse.ok) {
        throw new Error(`Failed to reregister domain: ${registerResponse.error}`);
    }
});
