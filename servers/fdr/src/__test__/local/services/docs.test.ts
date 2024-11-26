import { DocsV1Write, FdrAPI } from "@fern-api/fdr-sdk";
import { uniqueId } from "lodash-es";
import { inject } from "vitest";
import { getAPIResponse, getClient } from "../util";

export const FONT_FILE_ID = DocsV1Write.FileId(uniqueId());
export const WRITE_DOCS_REGISTER_DEFINITION: DocsV1Write.DocsDefinition = {
    pages: {},
    config: {
        navigation: {
            items: [],
            landingPage: undefined,
        },
        root: undefined,
        typography: {
            headingsFont: {
                name: "Syne",
                fontFile: FONT_FILE_ID,
            },
            bodyFont: undefined,
            codeFont: undefined,
        },
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
        backgroundImage: undefined,
        logoV2: undefined,
        logo: undefined,
        colors: undefined,
        colorsV2: undefined,
    },
    jsFiles: undefined,
};

it("docs register", async () => {
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

    // load docs
    const docs = getAPIResponse(
        await fdr.docs.v1.read.getDocsForDomain({
            domain,
        }),
    );
    // assert docs have 2 file urls
    expect(Object.entries(docs.files)).toHaveLength(2);

    // re-register docs
    const startDocsRegisterResponse2 = getAPIResponse(
        await fdr.docs.v1.write.startDocsRegister({
            orgId: FdrAPI.OrgId("fern"),
            domain,
            filepaths: [],
        }),
    );
    await fdr.docs.v1.write.finishDocsRegister(startDocsRegisterResponse2.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
});

it("oneleet domain manipulation", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    const domain = `https://fern-${Math.random()}.docs.buildwithfern.com`
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: FdrAPI.OrgId(`plantstore-oneleet2024-test${Math.random()}`),
            apiId: FdrAPI.ApiId(""),
            domain: domain,
            customDomains: [],
            filepaths: [
                DocsV1Write.FilePath("logo.png"),
                DocsV1Write.FilePath("guides/guide.mdx"),
                DocsV1Write.FilePath("fonts/Syne.woff2"),
            ],
        }),
    );
    await fdr.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });

    const startDocsRegisterResponse2 = await fdr.docs.v2.write.startDocsRegister({
        orgId: FdrAPI.OrgId(`plantstore-oneleet2024-test${Math.random()}`),
        apiId: FdrAPI.ApiId(""),
        domain: domain + '//',
        customDomains: [],
        filepaths: [
            DocsV1Write.FilePath("logo.png"),
            DocsV1Write.FilePath("guides/guide.mdx"),
            DocsV1Write.FilePath("fonts/Syne.woff2"),
        ],
    });
    
    // expecting an error, because adding // to the domain should not bypass domain check
    expect ((startDocsRegisterResponse2 as any).error.content).toEqual({
        body: `The following domains belong to another organization: ${domain.replace('https://', '')}`,
        reason: "status-code",
        statusCode: 403,
    });
});

it("docs register V2", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: FdrAPI.OrgId("acme"),
            apiId: FdrAPI.ApiId("api"),
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: ["https://docs.useacme.com/docs"],
            filepaths: [
                DocsV1Write.FilePath("logo.png"),
                DocsV1Write.FilePath("guides/guide.mdx"),
                DocsV1Write.FilePath("fonts/Syne.woff2"),
            ],
        }),
    );
    await fdr.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
    // load docs
    let docs = getAPIResponse(
        await fdr.docs.v2.read.getDocsForUrl({
            url: DocsV1Write.Url("https://acme.docs.buildwithfern.com/my/random/slug"),
        }),
    );
    expect(docs.baseUrl.domain).toEqual("acme.docs.buildwithfern.com");
    expect(Object.entries(docs.definition.files)).toHaveLength(3);
    expect(docs.definition.config.typographyV2).toEqual({
        headingsFont: {
            type: "custom",
            name: "Syne",
            variants: [{ fontFile: FONT_FILE_ID }],
        },
    });
    // load docs again
    docs = getAPIResponse(
        await fdr.docs.v2.read.getDocsForUrl({
            url: DocsV1Write.Url("https://docs.useacme.com/docs/1/"),
        }),
    );
    expect(docs.baseUrl.domain).toEqual("docs.useacme.com");
    expect(docs.baseUrl.basePath).toEqual("/docs");
    expect(Object.entries(docs.definition.files)).toHaveLength(3);

    //re-register docs
    const startDocsRegisterResponse2 = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: FdrAPI.OrgId("acme"),
            apiId: FdrAPI.ApiId("api"),
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: ["https://docs.useacme.com"],
            filepaths: [],
        }),
    );
    await fdr.docs.v2.write.finishDocsRegister(startDocsRegisterResponse2.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
});

it("docs reindex", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: FdrAPI.OrgId("acme"),
            apiId: FdrAPI.ApiId("api"),
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: ["https://docs.useacme.com/docs"],
            filepaths: [
                DocsV1Write.FilePath("logo.png"),
                DocsV1Write.FilePath("guides/guide.mdx"),
                DocsV1Write.FilePath("fonts/Syne.woff2"),
            ],
        }),
    );
    await fdr.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });

    const first = getAPIResponse(
        await fdr.docs.v2.read.getDocsForUrl({
            url: DocsV1Write.Url("https://acme.docs.buildwithfern.com"),
        }),
    );

    const response = await fdr.docs.v2.write.reindexAlgoliaSearchRecords({
        url: DocsV1Write.Url("https://acme.docs.buildwithfern.com"),
    });

    expect(response.ok).toBeTruthy();

    const second = getAPIResponse(
        await fdr.docs.v2.read.getDocsForUrl({
            url: DocsV1Write.Url("https://acme.docs.buildwithfern.com"),
        }),
    );

    if (
        first.definition.search.type === "legacyMultiAlgoliaIndex" ||
        second.definition.search.type === "legacyMultiAlgoliaIndex"
    ) {
        throw new Error("Expected search type to be 'singleAlgoliaIndex'");
    }

    expect(first.definition.search.value).not.toEqual(second.definition.search.value);
});

test.sequential("revalidates a custom docs domain", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });

    const resp = await fdr.docs.v2.read.listAllDocsUrls();
    console.log(resp);

    if (!resp.ok) {
        throw new Error("Failed to list all docs urls");
    }

    const { urls } = resp.body;
    console.log(urls);

    expect(urls.length).toBeGreaterThan(0);
});
