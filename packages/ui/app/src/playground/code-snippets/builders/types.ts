import { PlaygroundAuthState, PlaygroundEndpointRequestFormState } from "../../types";
import { EndpointContext } from "../../types/endpoint-context";
import { buildEndpointUrl } from "../../utils";

export abstract class PlaygroundCodeSnippetBuilder {
    protected url: string;
    constructor(
        // TODO: make this more generic and easier to test by removing dependency on "ResolvedEndpointDefinition"
        protected context: EndpointContext,
        protected formState: PlaygroundEndpointRequestFormState,
        protected authState: PlaygroundAuthState,
        protected playgroundEnvironment: string | undefined,
    ) {
        // TODO: wire through the environment from hook
        this.url = buildEndpointUrl(context.endpoint, formState, playgroundEnvironment);
    }

    public abstract build(): string;
}
