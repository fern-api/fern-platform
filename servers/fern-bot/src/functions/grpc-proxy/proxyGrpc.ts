import { GrpcProxyRequest } from "@generated/api";
import { handlerWrapper } from "@libs/handler-wrapper";
import { proxyGrpcInternal } from "./actions/proxyGrpc";

// The relevant lambda request properties, referenced from
// https://docs.aws.amazon.com/lambda/latest/dg/urls-invocation.html#urls-payloads
interface LambdaHttpRequestPayload {
    body: string;

    // This is a custom property that we've added to the payload.
    skipDefaultSchema?: boolean;
}

export const proxyGrpc = async (payload: LambdaHttpRequestPayload): Promise<unknown> => {
    console.debug("Proxying gRPC request, received payload:", JSON.stringify(payload));
    const response = await proxyGrpcInternal({
        request: JSON.parse(payload.body) as GrpcProxyRequest,
        options: payload.skipDefaultSchema != null ? { skipDefaultSchema: payload.skipDefaultSchema } : undefined,
    });
    console.debug("Received gRPC response body:", response.body);
    return response.body;
};

export const handler = handlerWrapper(proxyGrpc);
