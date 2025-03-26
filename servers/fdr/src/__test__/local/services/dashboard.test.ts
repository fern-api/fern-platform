import { inject } from "vitest";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { getAPIResponse, getClient } from "../util";
import { WRITE_DOCS_REGISTER_DEFINITION } from "./docs.test";

it("get my docs sties", async () => {
  const fdr = getClient({ authed: true, url: inject("url") });

  const startDocsRegisterResponse = getAPIResponse(
    await fdr.docs.v2.write.startDocsRegister({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("api"),
      domain: "https://acme.docs.buildwithfern.com",
      customDomains: [],
      filepaths: [],
    })
  );
  await fdr.docs.v1.write.finishDocsRegister(
    startDocsRegisterResponse.docsRegistrationId,
    { docsDefinition: WRITE_DOCS_REGISTER_DEFINITION }
  );

  const docsSites = getAPIResponse(
    await fdr.dashboard.getDocsSitesForOrg({
      orgId: FdrAPI.OrgId("acme"),
    })
  );

  expect(docsSites).toEqual({
    docsSites: [
      {
        mainUrl: {
          domain: "acme.docs.buildwithfern.com",
          path: "",
        },
        urls: [
          {
            domain: "acme.docs.buildwithfern.com",
            path: "",
          },
        ],
      },
    ],
  });
});
