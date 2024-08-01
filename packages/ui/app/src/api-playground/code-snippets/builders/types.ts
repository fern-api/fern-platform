import { ResolvedEndpointDefinition } from "../../../resolver/types";
import { PlaygroundEndpointRequestFormState } from "../../types";
import { buildEndpointUrl } from "../../utils";

export abstract class PlaygroundCodeSnippetBuilder {
    protected url: string;
    constructor(
        protected endpoint: ResolvedEndpointDefinition,
        protected headers: Record<string, unknown>,
        protected formState: PlaygroundEndpointRequestFormState,
    ) {
        // TODO: wire through the environment from hook
        this.url = buildEndpointUrl(endpoint, formState);
    }

    public abstract build(): string;
}
