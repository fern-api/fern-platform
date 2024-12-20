import { FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { FernRegistry } from "../../../api/generated";
import { CHAT_COMPLETION_PAYLOAD, CHAT_COMPLETION_SNIPPET } from "../../octo";
import { getAPIResponse, getClient } from "../util";

const ENDPOINT: FdrAPI.EndpointIdentifier = {
  path: FdrAPI.EndpointPathLiteral("/users/v1"),
  method: "GET",
  identifierOverride: undefined,
};
const SDK: FdrAPI.Sdk = {
  type: "go",
  githubRepo: "https://github.com/users-api/users-go",
  version: "0.0.15",
};

it("create snippet template", async () => {
  const unauthedFdr = getClient({ authed: false, url: inject("url") });
  const fdr = getClient({ authed: true, url: inject("url") });

  const orgId = FdrAPI.OrgId("acme");

  // register API definition for acme org
  await unauthedFdr.templates.register({
    orgId,
    apiId: FdrAPI.ApiId("user"),
    apiDefinitionId: FdrAPI.ApiDefinitionId("...."),
    snippet: {
      endpointId: ENDPOINT,
      sdk: SDK,
      snippetTemplate: {
        type: "v1",
        clientInstantiation: "client := userclient.New()",
        functionInvocation: {
          type: "generic",
          templateString: "client.GetUsers()",
          isOptional: false,
          imports: undefined,
          templateInputs: undefined,
          inputDelimiter: undefined,
        },
      },
      additionalTemplates: undefined,
    },
  });
  // create snippets
  const response = await fdr.templates.get({
    orgId,
    apiId: FdrAPI.ApiId("user"),
    endpointId: ENDPOINT,
    sdk: SDK,
  });
  console.log(JSON.stringify(response, null, 2));
  expect(response.ok).toBe(true);
  if (!response.ok) {
    throw new Error("Failed to load snippet template");
  }
  expect(response.body.endpointId).toEqual(ENDPOINT);
});

it("generate example from snippet template", async () => {
  const unauthedFdr = getClient({ authed: false, url: inject("url") });
  const fdr = getClient({ authed: true, url: inject("url") });

  const orgId = FdrAPI.OrgId("octoai");
  const apiId = FdrAPI.ApiId("api");
  const sdk: FernRegistry.Sdk = {
    type: "python",
    package: "octoai",
    version: "0.0.5",
  };

  // register API definition for acme org
  await unauthedFdr.templates.register({
    orgId,
    apiId,
    apiDefinitionId: FdrAPI.ApiDefinitionId("...."),
    snippet: CHAT_COMPLETION_SNIPPET("0.0.5"),
  });
  // create snippets
  await fdr.templates.get({
    orgId,
    apiId,
    endpointId: CHAT_COMPLETION_SNIPPET("0.0.5").endpointId,
    sdk,
  });

  const response = await fdr.snippets.get({
    orgId,
    apiId,
    endpoint: CHAT_COMPLETION_SNIPPET("0.0.5").endpointId,
    sdks: [sdk],
    payload: CHAT_COMPLETION_PAYLOAD,
  });
  expect(response.ok).toBe(true);
  console.log(JSON.stringify(response, null, 2));
});

it("fallback to version", async () => {
  const unauthedFdr = getClient({ authed: false, url: inject("url") });
  const fdr = getClient({ authed: true, url: inject("url") });

  const orgId = FdrAPI.OrgId("octoai");
  const apiId = FdrAPI.ApiId("api");
  const sdk: FernRegistry.Sdk = {
    type: "python",
    package: "octoai",
    version: "0.0.6",
  };
  const genericRequest: FernRegistry.SdkRequest = {
    type: "python",
    package: "octoai",
    version: undefined,
  };

  // register API definition for acme org
  const reg = await unauthedFdr.templates.register({
    orgId,
    apiId,
    apiDefinitionId: FdrAPI.ApiDefinitionId("...."),
    snippet: CHAT_COMPLETION_SNIPPET("0.0.6"),
  });
  expect(reg.ok).toBe(true);
  // create snippets
  const template = getAPIResponse(
    await fdr.templates.get({
      orgId,
      apiId,
      endpointId: CHAT_COMPLETION_SNIPPET("0.0.6").endpointId,
      sdk: genericRequest,
    })
  );
  expect(template.sdk.version).toBe("0.0.6");

  // register API definition for acme org
  const regAgain = await unauthedFdr.templates.register({
    orgId,
    apiId,
    apiDefinitionId: FdrAPI.ApiDefinitionId("...."),
    snippet: CHAT_COMPLETION_SNIPPET("0.0.122"),
  });
  expect(regAgain.ok).toBe(true);
  // create snippets
  const templateAgain = getAPIResponse(
    await fdr.templates.get({
      orgId,
      apiId,
      endpointId: CHAT_COMPLETION_SNIPPET("0.0.122").endpointId,
      sdk: genericRequest,
    })
  );
  expect(templateAgain.sdk.version).toBe("0.0.122");

  const templateSpecify = await fdr.templates.get({
    orgId,
    apiId,
    endpointId: CHAT_COMPLETION_SNIPPET("0.0.6").endpointId,
    sdk,
  });
  expect(templateSpecify.ok).toBe(true);
  if (templateSpecify.ok) {
    expect(templateSpecify.body.sdk.version).toBe("0.0.6");
  }
});
