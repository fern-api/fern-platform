import { inject } from "vitest";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { FernRegistry } from "../../../api/generated";
import { getAPIResponse, getClient } from "../util";

const EMPTY_DOCS_DEFINITION: FernRegistry.docs.v1.write.DocsDefinition = {
  pages: {},
  config: {
    title: undefined,
    defaultLanguage: undefined,
    announcement: undefined,
    navigation: undefined,
    root: undefined,
    navbarLinks: undefined,
    footerLinks: undefined,
    hideNavLinks: undefined,
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
    aiChatConfig: undefined,
    backgroundImage: undefined,
    logoV2: undefined,
    logo: undefined,
    colors: undefined,
    colorsV2: undefined,
    typography: undefined,
  },
  jsFiles: undefined,
};

it("get my docs sties", async () => {
  const fdr = getClient({ authed: true, url: inject("url") });

  const startDocsRegisterResponse = getAPIResponse(
    await fdr.docs.v2.write.startDocsRegister({
      orgId: FdrAPI.OrgId("fern"),
      domain: "www.domain.com",
      customDomains: ["www.custom-domain.com"],
      apiId: FdrAPI.ApiId("my-api"),
      filepaths: [],
    })
  );
  await fdr.docs.v1.write.finishDocsRegister(
    startDocsRegisterResponse.docsRegistrationId,
    { docsDefinition: EMPTY_DOCS_DEFINITION }
  );

  const startDocsRegisterResponse2 = getAPIResponse(
    await fdr.docs.v2.write.startDocsRegister({
      orgId: FdrAPI.OrgId("fern"),
      domain: "www.other-domain.com",
      customDomains: [
        "www.other-custom-domain-1.com",
        "www.other-custom-domain-2.com",
      ],
      apiId: FdrAPI.ApiId("my-api"),
      filepaths: [],
    })
  );
  await fdr.docs.v2.write.finishDocsRegister(
    startDocsRegisterResponse2.docsRegistrationId,
    { docsDefinition: EMPTY_DOCS_DEFINITION }
  );

  const docsSites = getAPIResponse(
    await fdr.dashboard.getDocsSitesForOrg({
      orgId: FdrAPI.OrgId("fern"),
    })
  );

  expect(docsSites).toEqual({
    docsSites: [],
  });
});
