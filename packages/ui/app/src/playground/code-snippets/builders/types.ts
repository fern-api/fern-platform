import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { PlaygroundEndpointRequestFormState } from "../../types";
import { buildEndpointUrl } from "../../utils";

export abstract class PlaygroundCodeSnippetBuilder {
    protected url: string;
    constructor(
        // TODO: make this more generic and easier to test by removing dependency on "ResolvedEndpointDefinition"
        protected endpoint: ApiDefinition.EndpointDefinition,
        protected formState: PlaygroundEndpointRequestFormState,
    ) {
        // TODO: wire through the environment from hook
        this.url = buildEndpointUrl(endpoint, formState);
    }

    public abstract build(): string;
}
