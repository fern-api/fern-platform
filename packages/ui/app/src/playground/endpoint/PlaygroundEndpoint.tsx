import { FernTooltipProvider } from "@fern-ui/components";
import { unknownToString } from "@fern-ui/core-utils";
import { Loadable, failed, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { useEventCallback } from "@fern-ui/react-commons";
import { SendSolid } from "iconoir-react";
import { useSetAtom } from "jotai";
import { mapValues } from "lodash-es";
import { FC, ReactElement, useCallback, useState } from "react";
import { captureSentryError } from "../../analytics/sentry";
import {
    PLAYGROUND_AUTH_STATE_ATOM,
    PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
    store,
    useBasePath,
    useFeatureFlags,
    usePlaygroundEndpointFormState,
    usePlaygroundEnvironment,
} from "../../atoms";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { useApiRoute } from "../../hooks/useApiRoute";
import { usePlaygroundSettings } from "../../hooks/usePlaygroundSettings";
import { getAppBuildwithfernCom } from "../../hooks/useStandardProxyEnvironment";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition, resolveEnvironment } from "../../resolver/types";
import { executeGrpc } from "../fetch-utils/executeGrpc";
import { executeProxyFile } from "../fetch-utils/executeProxyFile";
import { executeProxyRest } from "../fetch-utils/executeProxyRest";
import { executeProxyStream } from "../fetch-utils/executeProxyStream";
import type { GrpcProxyRequest, ProxyRequest } from "../types";
import { PlaygroundResponse } from "../types/playgroundResponse";
import {
    buildAuthHeaders,
    buildEndpointUrl,
    getInitialEndpointRequestFormState,
    getInitialEndpointRequestFormStateWithExample,
    serializeFormStateBody,
} from "../utils";
import { PlaygroundEndpointContent } from "./PlaygroundEndpointContent";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";

interface PlaygroundEndpointProps {
    endpoint: ResolvedEndpointDefinition;
    types: Record<string, ResolvedTypeDefinition>;
}

export const PlaygroundEndpoint: FC<PlaygroundEndpointProps> = ({ endpoint, types }): ReactElement => {
    const [formState, setFormState] = usePlaygroundEndpointFormState(endpoint);

    const resetWithExample = useEventCallback(() => {
        setFormState(getInitialEndpointRequestFormStateWithExample(endpoint, endpoint.examples[0], types));
    });

    const resetWithoutExample = useEventCallback(() => {
        setFormState(getInitialEndpointRequestFormState(endpoint, types));
    });

    const basePath = useBasePath();
    const { usesApplicationJsonInFormDataValue, proxyShouldUseAppBuildwithfernCom, grpcEndpoints } = useFeatureFlags();
    const [response, setResponse] = useState<Loadable<PlaygroundResponse>>(notStartedLoading());

    const proxyBasePath = proxyShouldUseAppBuildwithfernCom ? getAppBuildwithfernCom() : basePath;
    const proxyEnvironment = useApiRoute("/api/fern-docs/proxy", { basepath: proxyBasePath });
    const uploadEnvironment = useApiRoute("/api/fern-docs/upload", { basepath: proxyBasePath });
    const playgroundEnvironment = usePlaygroundEnvironment();

    // TODO: remove potentially
    // const grpcClient = useMemo(() => {
    //     return new FernProxyClient({
    //         environment: "https://kmxxylsbwyu2f4x7rbhreris3i0zfbys.lambda-url.us-east-1.on.aws/",
    //     });
    // }, []);

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
                    playgroundEnvironment,
                    setValue: setOAuthValue,
                },
            );
            const headers = {
                ...authHeaders,
                ...mapValues(formState.headers ?? {}, (value) => unknownToString(value)),
            };

            if (endpoint.method !== "GET" && endpoint.requestBody?.contentType != null) {
                headers["Content-Type"] = endpoint.requestBody.contentType;
            }

            const req: ProxyRequest = {
                url: buildEndpointUrl(endpoint, formState, playgroundEnvironment),
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
    }, [
        endpoint,
        formState,
        proxyEnvironment,
        uploadEnvironment,
        usesApplicationJsonInFormDataValue,
        playgroundEnvironment,
        setOAuthValue,
    ]);

    // Figure out if GRPC endpoint
    const sendGrpcRequest = useCallback(async () => {
        if (endpoint == null) {
            return;
        }
        setResponse(loading());
        try {
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
                    playgroundEnvironment,
                    setValue: setOAuthValue,
                },
            );
            const headers = {
                ...authHeaders,
                ...mapValues(formState.headers ?? {}, (value) => unknownToString(value)),
            };

            const req: GrpcProxyRequest = {
                url: buildEndpointUrl(endpoint, formState, playgroundEnvironment),
                endpointId: endpoint.id,
                headers,
                body: await serializeFormStateBody(
                    uploadEnvironment,
                    endpoint.requestBody?.shape,
                    formState.body,
                    usesApplicationJsonInFormDataValue,
                ),
            };

            const res = await executeGrpc(proxyEnvironment, req);
            setResponse(loaded(res));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            setResponse(failed(e));
        }
    }, [
        endpoint,
        formState,
        proxyEnvironment,
        uploadEnvironment,
        usesApplicationJsonInFormDataValue,
        playgroundEnvironment,
        setOAuthValue,
    ]);

    const selectedEnvironmentId = useSelectedEnvironmentId();

    const settings = usePlaygroundSettings();

    return (
        <FernTooltipProvider>
            <div className="flex min-h-0 flex-1 shrink flex-col size-full">
                <div className="flex-0">
                    <PlaygroundEndpointPath
                        method={endpoint.method}
                        formState={formState}
                        // TODO: Remove this after pinecone demo, this is a temporary flag
                        sendRequest={grpcEndpoints?.includes(endpoint.id) ? sendGrpcRequest : sendRequest}
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
                        // TODO: Remove this after pinecone demo, this is a temporary flag
                        sendRequest={grpcEndpoints?.includes(endpoint.id) ? sendGrpcRequest : sendRequest}
                        types={types}
                    />
                </div>
            </div>
        </FernTooltipProvider>
    );
};
