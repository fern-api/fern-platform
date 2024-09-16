import { FernTooltipProvider } from "@fern-ui/components";
import { Loadable, failed, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { SendSolid } from "iconoir-react";
import { useSetAtom } from "jotai";
import { mapValues } from "lodash-es";
import { FC, ReactElement, useCallback, useState } from "react";
import { useCallbackOne } from "use-memo-one";
import { captureSentryError } from "../../analytics/sentry";
import {
    PLAYGROUND_AUTH_STATE_ATOM,
    PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
    store,
    useBasePath,
    useFeatureFlags,
    usePlaygroundEndpointFormState,
} from "../../atoms";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { useApiRoute } from "../../hooks/useApiRoute";
import { usePlaygroundSettings } from "../../hooks/usePlaygroundSettings";
import { getAppBuildwithfernCom } from "../../hooks/useStandardProxyEnvironment";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition, resolveEnvironment } from "../../resolver/types";
import { executeProxyFile } from "../fetch-utils/executeProxyFile";
import { executeProxyRest } from "../fetch-utils/executeProxyRest";
import { executeProxyStream } from "../fetch-utils/executeProxyStream";
import type { ProxyRequest } from "../types";
import { PlaygroundResponse } from "../types/playgroundResponse";
import {
    buildAuthHeaders,
    buildEndpointUrl,
    getInitialEndpointRequestFormState,
    getInitialEndpointRequestFormStateWithExample,
    serializeFormStateBody,
    unknownToString,
} from "../utils";
import { PlaygroundEndpointContent } from "./PlaygroundEndpointContent";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";

interface PlaygroundEndpointProps {
    endpoint: ResolvedEndpointDefinition;
    types: Record<string, ResolvedTypeDefinition>;
}

export const PlaygroundEndpoint: FC<PlaygroundEndpointProps> = ({ endpoint, types }): ReactElement => {
    const [formState, setFormState] = usePlaygroundEndpointFormState(endpoint);

    const resetWithExample = useCallbackOne(() => {
        setFormState(getInitialEndpointRequestFormStateWithExample(endpoint, endpoint.examples[0], types));
    }, [endpoint, types]);

    const resetWithoutExample = useCallbackOne(() => {
        setFormState(getInitialEndpointRequestFormState(endpoint, types));
    }, []);

    const basePath = useBasePath();
    const { usesApplicationJsonInFormDataValue, proxyShouldUseAppBuildwithfernCom } = useFeatureFlags();
    const [response, setResponse] = useState<Loadable<PlaygroundResponse>>(notStartedLoading());

    const proxyBasePath = proxyShouldUseAppBuildwithfernCom ? getAppBuildwithfernCom() : basePath;
    const proxyEnvironment = useApiRoute("/api/fern-docs/proxy", { basepath: proxyBasePath });
    const uploadEnvironment = useApiRoute("/api/fern-docs/upload", { basepath: proxyBasePath });

    const setOAuthValue = useSetAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);

    const sendRequest = useCallback(async () => {
        if (endpoint == null) {
            return;
        }
        setResponse(loading());
        try {
            const { capturePosthogEvent } = await import("../../analytics/posthog");
            capturePosthogEvent("api_playground_request_sent", {
                endpointId: endpoint.id,
                endpointName: endpoint.title,
                method: endpoint.method,
                docsRoute: `/${endpoint.slug}`,
            });
            const authHeaders = buildAuthHeaders(
                endpoint.auth,
                store.get(PLAYGROUND_AUTH_STATE_ATOM),
                {
                    redacted: false,
                },
                {
                    formState,
                    endpoint,
                    proxyEnvironment,
                    setValue: setOAuthValue,
                },
            );
            const headers = {
                ...authHeaders,
                ...mapValues(formState.headers ?? {}, unknownToString),
            };

            if (endpoint.method !== "GET" && endpoint.requestBody?.contentType != null) {
                headers["Content-Type"] = endpoint.requestBody.contentType;
            }

            const req: ProxyRequest = {
                url: buildEndpointUrl(endpoint, formState),
                method: endpoint.method,
                headers,
                body: await serializeFormStateBody(
                    uploadEnvironment,
                    endpoint.requestBody?.shape,
                    formState.body,
                    usesApplicationJsonInFormDataValue,
                ),
            };
            if (endpoint.responseBody?.shape.type === "stream") {
                const [res, stream] = await executeProxyStream(proxyEnvironment, req);
                for await (const item of stream) {
                    setResponse((lastValue) =>
                        loaded({
                            type: "stream",
                            response: {
                                status: res.status,
                                body: (lastValue.type === "loaded" && lastValue.value.type === "stream"
                                    ? lastValue.value.response.body + item.data
                                    : item.data
                                ).replace("\r\n\r\n", "\n"),
                            },
                            time: item.time,
                        }),
                    );
                }
            } else if (endpoint.responseBody?.shape.type === "fileDownload") {
                const res = await executeProxyFile(proxyEnvironment, req);
                setResponse(loaded(res));
            } else {
                const res = await executeProxyRest(proxyEnvironment, req);
                setResponse(loaded(res));
                if (res.type !== "stream") {
                    capturePosthogEvent("api_playground_request_received", {
                        endpointId: endpoint.id,
                        endpointName: endpoint.title,
                        method: endpoint.method,
                        docsRoute: `/${endpoint.slug}`,
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
            // eslint-disable-next-line no-console
            console.error(e);
            setResponse(failed(e));

            captureSentryError(e, {
                context: "ApiPlayground",
                errorSource: "sendRequest",
                errorDescription:
                    "An unexpected error occurred while sending request to the proxy server. This is likely a bug, rather than a user error.",
                data: {
                    endpointId: endpoint.id,
                    endpointName: endpoint.title,
                    method: endpoint.method,
                    route: `/${endpoint.slug}`,
                },
            });
        }
    }, [endpoint, formState, proxyEnvironment, uploadEnvironment, usesApplicationJsonInFormDataValue, setOAuthValue]);

    const selectedEnvironmentId = useSelectedEnvironmentId();

    const settings = usePlaygroundSettings();

    return (
        <FernTooltipProvider>
            <div className="flex size-full min-h-0 flex-1 shrink flex-col">
                <div className="flex-0">
                    <PlaygroundEndpointPath
                        method={endpoint.method}
                        formState={formState}
                        sendRequest={sendRequest}
                        environment={resolveEnvironment(endpoint, selectedEnvironmentId)}
                        environmentFilters={settings?.environments}
                        path={endpoint.path}
                        queryParameters={endpoint.queryParameters}
                        sendRequestIcon={<SendSolid className="transition-transform group-hover:translate-x-0.5" />}
                    />
                </div>
                <div className="flex min-h-0 flex-1 shrink">
                    <PlaygroundEndpointContent
                        endpoint={endpoint}
                        formState={formState}
                        setFormState={setFormState}
                        resetWithExample={resetWithExample}
                        resetWithoutExample={resetWithoutExample}
                        response={response}
                        sendRequest={sendRequest}
                        types={types}
                    />
                </div>
            </div>
        </FernTooltipProvider>
    );
};
