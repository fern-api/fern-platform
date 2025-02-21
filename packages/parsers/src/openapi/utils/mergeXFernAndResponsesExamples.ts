import { FernRegistry } from "../../client/generated";

export function mergeXFernAndResponseExamples(
  xFernExamples: FernRegistry.api.latest.ExampleEndpointCall[] | undefined,
  responseExamples: FernRegistry.api.latest.ExampleEndpointCall[] | undefined
): FernRegistry.api.latest.ExampleEndpointCall[] | undefined {
  if (xFernExamples == null) {
    return responseExamples;
  }

  if (responseExamples == null) {
    return xFernExamples;
  }

  const mergedExamples: FernRegistry.api.latest.ExampleEndpointCall[] = [];
  for (const example of xFernExamples) {
    for (const responseExample of responseExamples) {
      if (
        responseExample.responseStatusCode >= 200 &&
        responseExample.responseStatusCode < 400
      ) {
        mergedExamples.push({
          path: example.path ?? responseExample.path,
          responseStatusCode:
            example.responseStatusCode ?? responseExample.responseStatusCode,
          name: example.name ?? responseExample.name,
          description: example.description ?? responseExample.description,
          pathParameters:
            example.pathParameters ?? responseExample.pathParameters,
          queryParameters:
            example.queryParameters ?? responseExample.queryParameters,
          headers: example.headers ?? responseExample.headers,
          requestBody: example.requestBody ?? responseExample.requestBody,
          responseBody: example.responseBody ?? responseExample.responseBody,
          snippets: {
            ...responseExample.snippets,
            ...example.snippets,
          },
        });
      }
    }
  }

  return mergedExamples;
}
