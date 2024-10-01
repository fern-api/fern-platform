import { FernProxyClient } from "@fern-fern/proxy-sdk";
import { GrpcProxyRequest, ProxyResponse } from "../types";
import { PlaygroundResponse } from "../types/playgroundResponse";

export async function executeGrpc(grpcClient: FernProxyClient, req: GrpcProxyRequest): Promise<PlaygroundResponse> {
    let time = 0;
    let intervalId: any;

    function startTimer() {
        intervalId = setInterval(() => {
            time++;
        }, 1000); // 1000 milliseconds = 1 second
    }

    function stopTimer() {
        clearInterval(intervalId);
    }

    startTimer();
    const grpcResponse = await grpcClient.grpc({
        baseUrl: req.url,
        endpoint: req.endpointId,
        headers: req.headers,
        body: req.body,
        schema: undefined,
    });
    stopTimer();

    return {
        type: "json",
        ...grpcResponse,
        contentType: "application/json",
        response: grpcResponse.body as ProxyResponse.SerializableBody,
        time,
        size: String(new TextEncoder().encode(JSON.stringify(grpcResponse.body)).length),
    };
}
