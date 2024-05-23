import { DocsV1Write } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { getAPIResponse, getClient } from "../util";

export const WRITE_DOCS_REGISTER_DEFINITION: DocsV1Write.DocsDefinition = {
    pages: {},
    config: {
        navigation: {
            items: [],
        },
    },
};

it("docs invalidate cache", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    const domain = `docs-${Math.random()}.fern.com`;

    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v1.write.startDocsRegister({
            orgId: "fern",
            domain,
            filepaths: ["logo.png", "guides/guide.mdx"],
        }),
    );
    await fdr.docs.v1.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });

    const response = await fdr.docsCache.invalidate({
        url: `https://${domain}`,
    });

    expect(response.ok).toEqual(true);
});
