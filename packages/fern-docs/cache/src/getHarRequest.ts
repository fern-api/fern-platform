import type { APIV1Read } from "@fern-api/fdr-sdk";
import {
  type AuthSchemeId,
  type EndpointDefinition,
  type ExampleEndpointCall,
  type ExampleEndpointRequest,
  buildEndpointUrl,
} from "@fern-api/fdr-sdk/api-definition";
import {
  unknownToString,
  visitDiscriminatedUnion,
} from "@fern-api/ui-core-utils";
import type { HarRequest } from "httpsnippet-lite";

export function getHarRequest(
  endpoint: EndpointDefinition,
  example: ExampleEndpointCall,
  auths: Record<AuthSchemeId, APIV1Read.ApiAuth>,
  requestBody: ExampleEndpointRequest | undefined
): HarRequest {
  const request: HarRequest = {
    httpVersion: "1.1",
    method: "GET",
    url: "",
    headers: [],
    headersSize: -1,
    queryString: [],
    cookies: [],
    bodySize: -1,
  };
  request.url = buildEndpointUrl({
    endpoint,
    // omit query parameters here because they are included in the `queryString` field
    pathParameters: example.pathParameters,
  });
  request.method = endpoint.method;
  request.queryString = Object.entries(example.queryParameters ?? {}).map(
    ([name, value]) => ({
      name,
      value: unknownToString(value),
    })
  );
  request.headers = Object.entries(example.headers ?? {}).map(
    ([name, value]) => ({
      name,
      value: unknownToString(value),
    })
  );

  let mimeType = endpoint.requests?.[0]?.contentType;

  if (requestBody != null) {
    if (mimeType == null) {
      mimeType =
        requestBody.type === "json"
          ? "application/json"
          : "multipart/form-data";
    }
    request.postData = {
      mimeType,
    };

    if (requestBody.type === "json") {
      request.postData.text = JSON.stringify(requestBody.value, null, 2);
    } else if (requestBody.type === "form") {
      request.postData.params = [];

      for (const [name, value] of Object.entries(requestBody.value)) {
        if (value.type === "json") {
          request.postData.params.push({
            name,
            value: JSON.stringify(value.value, null, 2),
          });
        } else if (value.type === "filename") {
          request.postData.params.push({
            name,
            fileName: value.value,
          });
        } else if (value.type === "filenameWithData") {
          request.postData.params.push({
            name,
            fileName: value.filename,
          });
        } else if (value.type === "filenames") {
          for (const fileName of value.value) {
            request.postData.params.push({
              name,
              fileName,
            });
          }
        } else if (value.type === "filenamesWithData") {
          for (const { filename } of value.value) {
            request.postData.params.push({
              name,
              fileName: filename,
            });
          }
        }
      }
    } else if (requestBody.type === "bytes") {
      // TODO: verify this is correct
      request.postData.params = [
        { name: "file", value: requestBody.value.value },
      ];
    }
  }

  const auth = endpoint.auth?.[0] != null ? auths[endpoint.auth[0]] : undefined;

  if (auth != null) {
    visitDiscriminatedUnion(auth)._visit({
      basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
        request.headers.push({
          name: "Authorization",
          value: `Basic <${usernameName}>:<${passwordName}>`,
        });
      },
      bearerAuth: ({ tokenName = "token" }) => {
        request.headers.push({
          name: "Authorization",
          value: `Bearer <${tokenName}>`,
        });
      },
      header: ({ headerWireValue, nameOverride = headerWireValue, prefix }) => {
        request.headers.push({
          name: headerWireValue,
          value:
            prefix != null
              ? `${prefix} <${nameOverride}>`
              : `<${nameOverride}>`,
        });
      },
      oAuth: (oAuth) => {
        visitDiscriminatedUnion(oAuth.value, "type")._visit({
          clientCredentials: (clientCredentials) => {
            visitDiscriminatedUnion(clientCredentials.value, "type")._visit({
              referencedEndpoint: () => {
                request.headers.push({
                  name: clientCredentials.value.headerName || "Authorization",
                  value: `${clientCredentials.value.tokenPrefix ? `${clientCredentials.value.tokenPrefix ?? "Bearer"} ` : ""}<token>.`,
                });
              },
            });
          },
        });
      },
    });
  }

  if (mimeType != null) {
    request.headers.push({
      name: "Content-Type",
      value: mimeType,
    });
  }

  return request;
}
