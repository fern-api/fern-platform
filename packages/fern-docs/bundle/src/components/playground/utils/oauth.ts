import type { APIV1Read } from "@fern-api/fdr-sdk";
import {
  buildEndpointUrl,
  type EndpointDefinition,
} from "@fern-api/fdr-sdk/api-definition";
import {
  unknownToString,
  visitDiscriminatedUnion,
} from "@fern-api/ui-core-utils";
import { mapValues } from "es-toolkit/object";
import { JSONPath } from "jsonpath-plus";
import { executeProxyRest } from "../fetch-utils/executeProxyRest";
import { PlaygroundEndpointRequestFormState, ProxyRequest } from "../types";
import { serializeFormStateBody } from "./serialize";

export interface OAuthClientCredentialReferencedEndpointLoginFlowProps {
  formState: PlaygroundEndpointRequestFormState;
  endpoint: EndpointDefinition;
  referencedEndpoint: APIV1Read.OAuthClientCredentialsReferencedEndpoint;
  baseUrl: string | undefined;
  setValue: (value: (prev: any) => any) => void;
  closeContainer?: () => void;
  setDisplayFailedLogin?: (value: boolean) => void;
}

export const oAuthClientCredentialReferencedEndpointLoginFlow = async ({
  formState,
  endpoint,
  referencedEndpoint,
  baseUrl,
  setValue,
  closeContainer,
  setDisplayFailedLogin,
}: OAuthClientCredentialReferencedEndpointLoginFlowProps): Promise<void> => {
  if (typeof window === "undefined") {
    return;
  }

  const headers: Record<string, string> = {
    ...mapValues(formState.headers ?? {}, (value) => unknownToString(value)),
  };

  if (
    endpoint.method !== "GET" &&
    endpoint.requests?.[0]?.contentType != null
  ) {
    headers["Content-Type"] = endpoint.requests[0].contentType;
  }

  const req: ProxyRequest = {
    url: buildEndpointUrl({
      endpoint,
      pathParameters: formState.pathParameters,
      queryParameters: formState.queryParameters,
      baseUrl,
    }),
    method: endpoint.method,
    headers,
    body: await serializeFormStateBody(
      endpoint.requests?.[0]?.body,
      formState.body,
      false
    ),
  };
  const res = await executeProxyRest(req);

  await visitDiscriminatedUnion(res, "type")._visit<void | Promise<void>>({
    json: async (jsonRes) => {
      if (jsonRes.response.ok) {
        try {
          const accessToken = JSONPath({
            path: referencedEndpoint.accessTokenLocator,
            json: jsonRes.response,
          })?.[0];
          setValue((prev) => ({
            ...prev,
            selectedInputMethod: "credentials",
            accessToken,
            isLoggedIn: true,
            loggedInStartingToken: accessToken,
          }));
          setTimeout(() => closeContainer && closeContainer(), 500);
        } catch (e) {
          console.error(e);
          closeContainer && closeContainer();
        }
      } else {
        setDisplayFailedLogin && setDisplayFailedLogin(true);
      }
    },
    string: () => {
      setDisplayFailedLogin && setDisplayFailedLogin(true);
    },
    file: () => {
      setDisplayFailedLogin && setDisplayFailedLogin(true);
    },
    stream: () => {
      setDisplayFailedLogin && setDisplayFailedLogin(true);
    },
    _other: () => {
      setDisplayFailedLogin && setDisplayFailedLogin(true);
    },
  });
};
