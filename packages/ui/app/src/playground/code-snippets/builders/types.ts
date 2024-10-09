import type { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { buildEndpointUrl } from "@fern-api/fdr-sdk/api-definition";
import { PlaygroundAuthState, PlaygroundEndpointRequestFormState } from "../../types";

export abstract class PlaygroundCodeSnippetBuilder {
    protected url: string;
    constructor(
        protected context: EndpointContext,
        protected formState: PlaygroundEndpointRequestFormState,
        protected authState: PlaygroundAuthState,
        protected baseUrl: string | undefined,
    ) {
        // TODO: wire through the environment from hook
        this.url = buildEndpointUrl({
            endpoint: context.endpoint,
            pathParameters: formState.pathParameters,
            queryParameters: formState.queryParameters,
            baseUrl,
        });
    }

    public abstract build(): string;
}
