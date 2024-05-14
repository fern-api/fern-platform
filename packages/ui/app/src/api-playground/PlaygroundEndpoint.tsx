import { assertNever, isNonNullish } from "@fern-ui/core-utils";
import { joinUrlSlugs } from "@fern-ui/fdr-utils";
import { Loadable, failed, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { compact } from "lodash-es";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useState } from "react";
import urljoin from "url-join";
import { capturePosthogEvent } from "../analytics/posthog";
import { captureSentryError } from "../analytics/sentry";
import { FernTooltipProvider } from "../components/FernTooltip";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import {
    ResolvedEndpointDefinition,
    ResolvedFormDataRequestProperty,
    ResolvedHttpRequestBodyShape,
    ResolvedTypeDefinition,
} from "../resolver/types";
import "./PlaygroundEndpoint.css";
import { PlaygroundEndpointContent } from "./PlaygroundEndpointContent";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";
import type {
    PlaygroundEndpointRequestFormState,
    PlaygroundFormStateBody,
    ProxyRequest,
    SerializableFile,
    SerializableFormDataEntryValue,
} from "./types";
import { PlaygroundResponse } from "./types/playgroundResponse";
import { buildEndpointUrl, buildUnredactedHeaders } from "./utils";
import { executeProxyFile } from "./utils/executeProxyFile";
import { executeProxyRest } from "./utils/executeProxyRest";
import { executeProxyStream } from "./utils/executeProxyStream";

interface PlaygroundEndpointProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    types: Record<string, ResolvedTypeDefinition>;
}

const APP_BUILDWITHFERN_COM = "https://app.buildwithfern.com";

export const PlaygroundEndpoint: FC<PlaygroundEndpointProps> = ({
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    types,
}): ReactElement => {
    const { basePath, domain } = useDocsContext();
    const { proxyShouldUseAppBuildwithfernCom } = useFeatureFlags();
    const [response, setResponse] = useState<Loadable<PlaygroundResponse>>(notStartedLoading());

    const proxyEnvironment = urljoin(
        proxyShouldUseAppBuildwithfernCom ? APP_BUILDWITHFERN_COM : basePath ?? "",
        "/api/fern-docs/proxy",
    );

    const sendRequest = useCallback(async () => {
        if (endpoint == null) {
            return;
        }
        setResponse(loading());
        try {
            capturePosthogEvent("api_playground_request_sent", {
                endpointId: endpoint.id,
                endpointName: endpoint.title,
                method: endpoint.method,
                docsRoute: `/${joinUrlSlugs(...endpoint.slug)}`,
            });
            const req = {
                url: buildEndpointUrl(endpoint, formState),
                method: endpoint.method,
                headers: buildUnredactedHeaders(endpoint, formState),
                body: await serializeFormStateBody(endpoint.requestBody?.shape, formState.body, basePath, domain),
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
                        docsRoute: `/${joinUrlSlugs(...endpoint.slug)}`,
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
                    route: `/${joinUrlSlugs(...endpoint.slug)}`,
                },
            });
        }
    }, [basePath, domain, endpoint, formState, proxyEnvironment]);

    return (
        <FernTooltipProvider>
            <div className="flex min-h-0 flex-1 shrink flex-col">
                <div className="flex-0">
                    <PlaygroundEndpointPath
                        method={endpoint.method}
                        formState={formState}
                        sendRequest={sendRequest}
                        environment={endpoint.defaultEnvironment ?? endpoint.environments[0]}
                        path={endpoint.path}
                        queryParameters={endpoint.queryParameters}
                        sendRequestIcon={
                            <PaperPlaneIcon className="size-6 transition-transform group-hover:translate-x-0.5" />
                        }
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

async function serializeFormStateBody(
    shape: ResolvedHttpRequestBodyShape | undefined,
    body: PlaygroundFormStateBody | undefined,
    basePath: string | undefined,
    domain: string,
): Promise<ProxyRequest.SerializableBody | undefined> {
    if (shape == null || body == null) {
        return undefined;
    }

    switch (body.type) {
        case "json":
            return { type: "json", value: body.value };
        case "form-data": {
            const formDataValue: Record<string, SerializableFormDataEntryValue> = {};
            for (const [key, value] of Object.entries(body.value)) {
                switch (value.type) {
                    case "file":
                        formDataValue[key] = {
                            type: "file",
                            value: await serializeFile(value.value, basePath),
                        };
                        break;
                    case "fileArray":
                        formDataValue[key] = {
                            type: "fileArray",
                            value: (
                                await Promise.all(value.value.map((value) => serializeFile(value, basePath)))
                            ).filter(isNonNullish),
                        };
                        break;
                    case "json": {
                        if (shape.type !== "formData") {
                            return undefined;
                        }
                        const property = shape.properties.find((p) => p.key === key && p.type === "bodyProperty") as
                            | ResolvedFormDataRequestProperty.BodyProperty
                            | undefined;
                        formDataValue[key] = {
                            ...value,
                            // this is a hack to allow the API Playground to send JSON blobs in form data
                            // revert this once we have a better solution
                            contentType:
                                compact(property?.contentType)[0] ??
                                (domain.includes("fileforge") ? "application/json" : undefined),
                        };
                        break;
                    }
                    default:
                        assertNever(value);
                }
            }
            return { type: "form-data", value: formDataValue };
        }
        case "octet-stream":
            return { type: "octet-stream", value: await serializeFile(body.value, basePath) };
        default:
            assertNever(body);
    }
}

async function blobToDataURL(file: File, basePath: string = "") {
    // vercel edge function has a maximum request size of 4.5MB, so we need to upload large files to S3
    // if blob is larger than 1MB, we will upload it to S3 and return the URL
    // TODO: we should probably measure that the _entire_ request is less than 4.5MB
    if (file.size > 1024 * 1024) {
        const response = await fetch(urljoin(basePath, `/api/fern-docs/upload?file=${encodeURIComponent(file.name)}`), {
            method: "GET",
        });

        const { put, get } = (await response.json()) as { put: string; get: string };

        await fetch(put, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
        });

        return get;
    }

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => urljoin(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function serializeFile(
    file: File | undefined,
    basePath: string | undefined,
): Promise<SerializableFile | undefined> {
    if (file == null || !isFile(file)) {
        return undefined;
    }
    return {
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        type: file.type,
        dataUrl: await blobToDataURL(file, basePath),
    };
}

function isFile(value: any): value is File {
    return value instanceof File;
}
