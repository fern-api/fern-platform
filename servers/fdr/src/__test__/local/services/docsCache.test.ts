import { DocsV1Write, FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { getAPIResponse, getClient } from "../util";

export const WRITE_DOCS_REGISTER_DEFINITION: DocsV1Write.DocsDefinition = {
    pages: {},
    config: {
        navigation: {
            items: [],
            landingPage: undefined,
        },
        root: undefined,
        title: undefined,
        defaultLanguage: undefined,
        announcement: undefined,
        navbarLinks: undefined,
        footerLinks: undefined,
        logoHeight: undefined,
        logoHref: undefined,
        favicon: undefined,
        metadata: undefined,
        redirects: undefined,
        colorsV3: undefined,
        layout: undefined,
        typographyV2: undefined,
        analyticsConfig: undefined,
        integrations: undefined,
        css: undefined,
        js: undefined,
        playground: undefined,
        backgroundImage: undefined,
        logoV2: undefined,
        logo: undefined,
        colors: undefined,
        colorsV2: undefined,
        typography: undefined,
    },
    jsFiles: undefined,
};

it("docs invalidate cache", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    const domain = `docs-${Math.random()}.fern.com`;

    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v1.write.startDocsRegister({
            orgId: FdrAPI.OrgId("fern"),
            domain,
            filepaths: [DocsV1Write.FilePath("logo.png"), DocsV1Write.FilePath("guides/guide.mdx")],
        }),
    );
    await fdr.docs.v1.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });

    const response = await fdr.docsCache.invalidate({
        url: FdrAPI.Url(`https://${domain}`),
    });

    expect(response.ok).toEqual(true);
});
