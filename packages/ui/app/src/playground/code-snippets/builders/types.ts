import { buildEndpointUrl } from "@fern-api/fdr-sdk/api-definition";
import { PlaygroundAuthState, PlaygroundEndpointRequestFormState } from "../../types";
import { EndpointContext } from "../../types/endpoint-context";

export abstract class PlaygroundCodeSnippetBuilder {
    protected url: string;
    constructor(
        // TODO: make this more generic and easier to test by removing dependency on "ResolvedEndpointDefinition"
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
