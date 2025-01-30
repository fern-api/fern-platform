import {
  convertToCurl,
  toSnippetHttpRequest,
} from "@fern-api/fdr-sdk/api-definition";

describe("curl snippet generation", () => {
  it("generates correct curl snippet", () => {
    const endpoint: EndpointDefinition = {
      id: { EndpointId: undefined },
      namespace: [],
      displayName: "Test Endpoint",
      operationId: "testEndpoint",
      method: "POST",
      path: [{ type: "literal", value: "test" }],
      requests: [
        {
          body: {
            type: "json",
            shape: {
              type: "object",
              properties: {
                foo: { type: "string" },
              },
            },
          },
        },
      ],
    };

    const example: ExampleEndpointCall = {
      path: "/test",
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

    const curlCode = convertToCurl(
      toSnippetHttpRequest(endpoint, example, undefined),
      { usesApplicationJsonInFormDataValue: false }
    );

    expect(curlCode).toMatchInlineSnapshot(`
      "curl -X POST /test \\
           -H "Content-Type: application/json" \\
           -d '{
        "foo": "bar"
      }'"
    `);
  });
});
