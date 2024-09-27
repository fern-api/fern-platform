import { ResolvedEndpointDefinition } from "../../../resolver/types";
import { PlaygroundEndpointRequestFormState } from "../../types";
import { buildEndpointUrl } from "../../utils";

export abstract class PlaygroundCodeSnippetBuilder {
    protected url: string;
    constructor(
        // TODO: make this more generic and easier to test by removing dependency on "ResolvedEndpointDefinition"
        protected endpoint: ResolvedEndpointDefinition,
        protected formState: PlaygroundEndpointRequestFormState,
    ) {
        // TODO: wire through the environment from hook
        this.url = buildEndpointUrl(endpoint, formState);
    }

    public abstract build(): string;
}
