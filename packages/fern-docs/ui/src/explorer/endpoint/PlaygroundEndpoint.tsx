import type { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { buildEndpointUrl } from "@fern-api/fdr-sdk/api-definition";
import { unknownToString } from "@fern-api/ui-core-utils";
import { FernTooltipProvider } from "@fern-docs/components";
import {
  Loadable,
  failed,
  loaded,
  loading,
  notStartedLoading,
} from "@fern-ui/loadable";
import { useEventCallback } from "@fern-ui/react-commons";
import { mapValues } from "es-toolkit/object";
import { SendSolid } from "iconoir-react";
import { useAtomValue, useSetAtom } from "jotai";
import { ReactElement, useCallback, useState } from "react";
import { track } from "../../analytics";
import {
  FERN_USER_ATOM,
  PLAYGROUND_AUTH_STATE_ATOM,
  PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
  store,
  useEdgeFlags,
  useExplorerEndpointFormState,
} from "../../atoms";
import { useExplorerSettings } from "../../hooks/useExplorerSettings";
import { executeProxyRest } from "../fetch-utils/executeProxyRest";
import { executeProxyStream } from "../fetch-utils/executeProxyStream";
import type { ProxyRequest } from "../types";
import { ExplorerResponse } from "../types/explorerResponse";
import {
  buildAuthHeaders,
  getInitialEndpointRequestFormStateWithExample,
  serializeFormStateBody,
} from "../utils";
import { useExplorerBaseUrl } from "../utils/select-environment";
import { ExplorerEndpointContent } from "./ExplorerEndpointContent";
import { ExplorerEndpointPath } from "./ExplorerEndpointPath";

export const ExplorerEndpoint = ({
  context,
}: {
  context: EndpointContext;
}): ReactElement => {
  const user = useAtomValue(FERN_USER_ATOM);
  const { node, endpoint, auth } = context;

  const [formState, setFormState] = useExplorerEndpointFormState(context);

  const resetWithExample = useEventCallback(() => {
    setFormState(
      getInitialEndpointRequestFormStateWithExample(
        context,
        context.endpoint.examples?.[0],
        user?.explorer?.initial_state
      )
    );
  });

  const resetWithoutExample = useEventCallback(() => {
    setFormState(
      getInitialEndpointRequestFormStateWithExample(
        context,
        undefined,
        user?.explorer?.initial_state
      )
    );
  });

  const { usesApplicationJsonInFormDataValue } = useEdgeFlags();
  const [response, setResponse] =
    useState<Loadable<ExplorerResponse>>(notStartedLoading());

  const [baseUrl, environmentId] = useExplorerBaseUrl(endpoint);

  const setOAuthValue = useSetAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);

  const sendRequest = useCallback(async () => {
    if (endpoint == null) {
      return;
    }
    setResponse(loading());
    try {
      track("api_explorer_request_sent", {
        endpointId: endpoint.id,
        endpointName: node.title,
        method: endpoint.method,
        docsRoute: `/${node.slug}`,
      });
      const authHeaders = buildAuthHeaders(
        auth,
        store.get(PLAYGROUND_AUTH_STATE_ATOM),
        {
          redacted: false,
        },
        {
          formState,
          endpoint,
          baseUrl,
          setValue: setOAuthValue,
        }
      );
      const headers = {
        ...authHeaders,
        ...mapValues(formState.headers ?? {}, (value) =>
          unknownToString(value)
        ),
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
          usesApplicationJsonInFormDataValue
        ),
      };
      if (endpoint.responses?.[0]?.body.type === "stream") {
        const [res, stream] = await executeProxyStream(req);

        const time = Date.now();
        const reader = stream.getReader();
        let result = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          result += decoder.decode(value);
          console.log(result);
          setResponse(
            loaded({
              type: "stream",
              response: {
                status: res.status,
                body: result,
              },
              time: Date.now() - time,
            })
          );
        }
      } else {
        const res = await executeProxyRest(req);
        setResponse(loaded(res));
        if (res.type !== "stream") {
          track("api_explorer_request_received", {
            endpointId: endpoint.id,
            endpointName: node.title,
            method: endpoint.method,
            docsRoute: `/${node.slug}`,
            response: {
              status: res.response.status,
              statusText: res.response.statusText,
              time: res.time,
              size: res.size,
            },
          });
        }
      }
    } catch (e) {
      // TODO: sentry

      console.error(
        "An unexpected error occurred while sending request to the proxy server. This is likely a bug, rather than a user error.",
        e
      );
      setResponse(failed(e));
    }
  }, [
    endpoint,
    node.title,
    node.slug,
    auth,
    formState,
    baseUrl,
    setOAuthValue,
    usesApplicationJsonInFormDataValue,
  ]);

  const settings = useExplorerSettings();

  return (
    <FernTooltipProvider>
      <div className="flex size-full min-h-0 flex-1 shrink flex-col">
        <div className="flex-0">
          <ExplorerEndpointPath
            method={endpoint.method}
            formState={formState}
            sendRequest={sendRequest}
            environmentId={environmentId}
            baseUrl={baseUrl}
            // TODO: this is a temporary fix to show all environments in the explorer, unless filtered in the settings
            // this is so that the explorer can be specifically disabled for certain environments
            options={
              settings?.environments
                ? endpoint.environments?.filter(
                    (env) => settings.environments?.includes(env.id) ?? true
                  )
                : endpoint.environments
            }
            path={endpoint.path}
            queryParameters={endpoint.queryParameters}
            sendRequestIcon={
              <SendSolid className="transition-transform group-hover:translate-x-0.5" />
            }
            types={context.types}
          />
        </div>
        <div className="flex min-h-0 flex-1 shrink">
          <ExplorerEndpointContent
            context={context}
            formState={formState}
            setFormState={setFormState}
            resetWithExample={resetWithExample}
            resetWithoutExample={resetWithoutExample}
            response={response}
            sendRequest={sendRequest}
          />
        </div>
      </div>
    </FernTooltipProvider>
  );
};
