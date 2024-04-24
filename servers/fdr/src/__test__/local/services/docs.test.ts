import { DocsV1Write } from "@fern-api/fdr-sdk";
import lodash from "lodash";
import { inject } from "vitest";
import { getAPIResponse, getClient } from "../util";
const { uniqueId } = lodash;

export const FONT_FILE_ID = uniqueId();
export const WRITE_DOCS_REGISTER_DEFINITION: DocsV1Write.DocsDefinition = {
    pages: {},
    config: {
        navigation: {
            items: [],
        },
        typography: {
            headingsFont: {
                name: "Syne",
                fontFile: FONT_FILE_ID,
            },
        },
    },
};

it("docs register", async () => {
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
            orgId: "fern",
            domain,
            filepaths: [],
        }),
    );
    await fdr.docs.v1.write.finishDocsRegister(startDocsRegisterResponse2.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
});

it.skip("docs register V2", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: "acme",
            apiId: "api",
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: ["https://docs.useacme.com/docs"],
            filepaths: ["logo.png", "guides/guide.mdx", "fonts/Syne.woff2"],
        }),
    );
    await fdr.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
    // load docs
    let docs = getAPIResponse(
        await fdr.docs.v2.read.getDocsForUrl({
            url: "https://acme.docs.buildwithfern.com/my/random/slug",
        }),
    );
    expect(docs.baseUrl.domain).toEqual("acme.docs.buildwithfern.com");
    expect(Object.entries(docs.definition.files)).toHaveLength(3);
    expect(docs.definition.config.typography).toEqual({
        headingsFont: {
            name: "Syne",
            fontFile: FONT_FILE_ID,
        },
    });
    // load docs again
    docs = getAPIResponse(
        await fdr.docs.v2.read.getDocsForUrl({
            url: "https://docs.useacme.com/docs/1/",
        }),
    );
    expect(docs.baseUrl.domain).toEqual("docs.useacme.com");
    expect(docs.baseUrl.basePath).toEqual("/docs");
    expect(Object.entries(docs.definition.files)).toHaveLength(3);

    //re-register docs
    const startDocsRegisterResponse2 = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: "acme",
            apiId: "api",
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: ["https://docs.useacme.com"],
            filepaths: [],
        }),
    );
    await fdr.docs.v2.write.finishDocsRegister(startDocsRegisterResponse2.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
});
