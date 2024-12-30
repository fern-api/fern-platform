import type { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { buildEndpointUrl } from "@fern-api/fdr-sdk/api-definition";
import { unknownToString } from "@fern-api/ui-core-utils";
import { FernTooltipProvider } from "@fern-ui/components";
import { Loadable, failed, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { useEventCallback } from "@fern-ui/react-commons";
import { mapValues } from "es-toolkit/object";
import { SendSolid } from "iconoir-react";
import { useAtomValue, useSetAtom } from "jotai";
import { ReactElement, useCallback, useState } from "react";
import {
    FERN_USER_ATOM,
    PLAYGROUND_AUTH_STATE_ATOM,
    PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
    store,
    useBasePath,
    useFeatureFlags,
    usePlaygroundEndpointFormState,
} from "../../atoms";
import { useApiRoute } from "../../hooks/useApiRoute";
import { usePlaygroundSettings } from "../../hooks/usePlaygroundSettings";
import { getAppBuildwithfernCom } from "../../hooks/useStandardProxyEnvironment";
import { executeGrpc } from "../fetch-utils/executeGrpc";
import { executeProxyFile } from "../fetch-utils/executeProxyFile";
import { executeProxyRest } from "../fetch-utils/executeProxyRest";
import { executeProxyStream } from "../fetch-utils/executeProxyStream";
import type { GrpcProxyRequest, ProxyRequest } from "../types";
import { PlaygroundResponse } from "../types/playgroundResponse";
import { buildAuthHeaders, getInitialEndpointRequestFormStateWithExample, serializeFormStateBody } from "../utils";
import { usePlaygroundBaseUrl } from "../utils/select-environment";
import { PlaygroundEndpointContent } from "./PlaygroundEndpointContent";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";

export const PlaygroundEndpoint = ({ context }: { context: EndpointContext }): ReactElement => {
    const user = useAtomValue(FERN_USER_ATOM);
    const { node, endpoint, auth } = context;

    const [formState, setFormState] = usePlaygroundEndpointFormState(context);

    const resetWithExample = useEventCallback(() => {
        setFormState(
            getInitialEndpointRequestFormStateWithExample(
                context,
                context.endpoint.examples?.[0],
                user?.playground?.initial_state,
            ),
        );
    });

    const resetWithoutExample = useEventCallback(() => {
        setFormState(
            getInitialEndpointRequestFormStateWithExample(context, undefined, user?.playground?.initial_state),
        );
    });

    const basePath = useBasePath();
    const { usesApplicationJsonInFormDataValue, proxyShouldUseAppBuildwithfernCom, grpcEndpoints } = useFeatureFlags();
    const [response, setResponse] = useState<Loadable<PlaygroundResponse>>(notStartedLoading());

    const proxyBasePath = proxyShouldUseAppBuildwithfernCom ? getAppBuildwithfernCom() : basePath;
    const proxyEnvironment = useApiRoute("/api/fern-docs/proxy", { basepath: proxyBasePath });
    const uploadEnvironment = useApiRoute("/api/fern-docs/upload", { basepath: proxyBasePath });
    const [baseUrl, environmentId] = usePlaygroundBaseUrl(endpoint);

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
                    proxyEnvironment,
                    baseUrl,
                    setValue: setOAuthValue,
                },
            );
            const headers = {
                ...authHeaders,
                ...mapValues(formState.headers ?? {}, (value) => unknownToString(value)),
            };

            if (endpoint.method !== "GET" && endpoint.request?.contentType != null) {
                headers["Content-Type"] = endpoint.request.contentType;
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
                    uploadEnvironment,
                    endpoint.request?.body,
                    formState.body,
                    usesApplicationJsonInFormDataValue,
                ),
            };
            if (endpoint.response?.body.type === "stream") {
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
            } else if (endpoint.response?.body.type === "fileDownload") {
                const res = await executeProxyFile(proxyEnvironment, req);
                setResponse(loaded(res));
            } else {
                const res = await executeProxyRest(proxyEnvironment, req);
                setResponse(loaded(res));
                if (res.type !== "stream") {
                    capturePosthogEvent("api_playground_request_received", {
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
            // eslint-disable-next-line no-console
            console.error(
                "An unexpected error occurred while sending request to the proxy server. This is likely a bug, rather than a user error.",
                e,
            );
            setResponse(failed(e));
        }
    }, [
        endpoint,
        node.title,
        node.slug,
        auth,
        formState,
        proxyEnvironment,
        baseUrl,
        setOAuthValue,
        uploadEnvironment,
        usesApplicationJsonInFormDataValue,
    ]);

    // Figure out if GRPC endpoint
    const sendGrpcRequest = useCallback(async () => {
        if (endpoint == null) {
            return;
        }
        setResponse(loading());
        try {
            const authHeaders = buildAuthHeaders(
                auth,
                store.get(PLAYGROUND_AUTH_STATE_ATOM),
                {
                    redacted: false,
                },
                {
                    formState,
                    endpoint,
                    proxyEnvironment,
                    baseUrl,
                    setValue: setOAuthValue,
                },
            );
            const headers = {
                ...authHeaders,
                ...mapValues(formState.headers ?? {}, (value) => unknownToString(value)),
            };

            const req: GrpcProxyRequest = {
                url: buildEndpointUrl({
                    endpoint,
                    pathParameters: formState.pathParameters,
                    queryParameters: formState.queryParameters,
                    baseUrl,
                }),
                endpointId: endpoint.id,
                headers,
                body: await serializeFormStateBody(
                    uploadEnvironment,
                    endpoint.request?.body,
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
        auth,
        formState,
        proxyEnvironment,
        baseUrl,
        setOAuthValue,
        uploadEnvironment,
        usesApplicationJsonInFormDataValue,
    ]);

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
                        environmentId={environmentId}
                        baseUrl={baseUrl}
                        // TODO: this is a temporary fix to show all environments in the playground, unless filtered in the settings
                        // this is so that the playground can be specifically disabled for certain environments
                        options={
                            settings?.environments
                                ? endpoint.environments?.filter(
                                      (env) => settings.environments?.includes(env.id) ?? true,
                                  )
                                : endpoint.environments
                        }
                        path={endpoint.path}
                        queryParameters={endpoint.queryParameters}
                        sendRequestIcon={<SendSolid className="transition-transform group-hover:translate-x-0.5" />}
                        types={context.types}
                    />
                </div>
                <div className="flex min-h-0 flex-1 shrink">
                    <PlaygroundEndpointContent
                        context={context}
                        formState={formState}
                        setFormState={setFormState}
                        resetWithExample={resetWithExample}
                        resetWithoutExample={resetWithoutExample}
                        response={response}
                        // TODO: Remove this after pinecone demo, this is a temporary flag
                        sendRequest={grpcEndpoints?.includes(endpoint.id) ? sendGrpcRequest : sendRequest}
                    />
                </div>
            </div>
        </FernTooltipProvider>
    );
};
