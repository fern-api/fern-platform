import { APIV1Read } from "@fern-api/fdr-sdk";
import {
  ApiDefinitionId,
  EndpointDefinition,
  EndpointId,
  ExampleEndpointCall,
  PropertyKey,
  convertToCurl,
  toSnippetHttpRequest,
} from "@fern-api/fdr-sdk/api-definition";

import { ApiDefinitionLoader } from "../ApiDefinitionLoader";

describe("curl snippet generation", () => {
  it("generates correct curl snippet", async () => {
    const example: ExampleEndpointCall = {
      path: "/test",
      description: "Test example",
      responseStatusCode: 200,
      name: "Test Example",
      pathParameters: {},
      queryParameters: {},
      headers: {},
      requestBody: {
        type: "json",
        value: { foo: "bar" },
      },
      responseBody: undefined,
      snippets: {},
    };

    const endpoint: EndpointDefinition = {
      id: EndpointId("testEndpoint"),
      auth: undefined,
      environments: [],
      defaultEnvironment: undefined,
      pathParameters: undefined,
      queryParameters: undefined,
      requestHeaders: undefined,
      responseHeaders: undefined,
      responses: undefined,
      errors: undefined,
      examples: [example],
      snippetTemplates: undefined,
      description: undefined,
      availability: undefined,
      namespace: [],
      displayName: "Test Endpoint",
      operationId: "testEndpoint",
      method: "POST",
      path: [{ type: "literal", value: "test" }],
      protocol: undefined,
      requests: [
        {
          contentType: undefined,
          description: undefined,
          body: {
            type: "object",
            properties: [
              {
                key: PropertyKey("foo"),
                description: "Test object",
                availability: undefined,
                valueShape: {
                  type: "alias",
                  value: {
                    type: "primitive",
                    value: {
                      type: "string",
                      format: undefined,
                      regex: undefined,
                      minLength: undefined,
                      maxLength: undefined,
                      default: undefined,
                    },
                  },
                },
              },
            ],
            extends: [],
            extraProperties: undefined,
          },
        },
      ],
    };

    const curlCode = convertToCurl(
      toSnippetHttpRequest(endpoint, example, undefined),
      { usesApplicationJsonInFormDataValue: false }
    );

    const loader = ApiDefinitionLoader.create(
      "testdomain",
      ApiDefinitionId("testdefinitionid")
    );

    const apiDefinition = await loader
      .withApiDefinition({
        id: ApiDefinitionId("id"),
        webhooks: {},
        websockets: {},
        types: {},
        subpackages: {},
        auths: {},
        globalHeaders: [],
        endpoints: {
          [EndpointId("endpoint")]: endpoint,
        },
      })
      .load();

    expect(curlCode).toMatchInlineSnapshot(`
      "curl -X POST /test \\
           -H "Content-Type: application/json" \\
           -d '{
        "foo": "bar"
      }'"
    `);

    expect(
      apiDefinition?.endpoints?.[EndpointId("testEndpoint")]?.examples?.[0]
        ?.snippets?.[APIV1Read.SupportedLanguage.Curl]?.[0]?.code
    ).toEqual(curlCode);
  });
});
