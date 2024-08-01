import { APIV1Read } from "@fern-api/fdr-sdk";
import { ObjectFlattener, getApiDefinition } from "./ResolutionUtilities";
import { SnippetTemplateResolver } from "./SnippetTemplateResolver";
import { CustomSnippetPayload, EndpointSnippetTemplate, Snippet } from "./generated/api";

export class SnippetTemplateResolutionHolder {
    private maybeApiDefinition: APIV1Read.ApiDefinition | undefined;
    private maybeObjectFlattener: ObjectFlattener | undefined;
    private maybeApiDefinitionId: string | undefined;

    private apiDefinitionHasBeenRequested: boolean;

    constructor({
        maybeApiDefinition,
        maybeApiDefinitionId,
    }: {
        maybeApiDefinition?: APIV1Read.ApiDefinition;
        maybeApiDefinitionId?: string;
    }) {
        this.maybeApiDefinition = maybeApiDefinition;
        this.maybeApiDefinitionId = maybeApiDefinitionId;

        if (maybeApiDefinition == null && maybeApiDefinitionId == null) {
            throw new Error(
                "Either an API definition or an API definition ID must be provided, if you have neither use the SnippetTemplateResolver directly.",
            );
        }
        this.apiDefinitionHasBeenRequested = false;
    }

    // Get or create and cache ApiDefinition
    private async getApiDefinition(): Promise<APIV1Read.ApiDefinition | undefined> {
        if (this.maybeApiDefinition != null) {
            return this.maybeApiDefinition;
        }

        // If we were not provided an API definition, try to get it from FDR
        if (this.maybeApiDefinitionId != null && !this.apiDefinitionHasBeenRequested) {
            this.apiDefinitionHasBeenRequested = true;
            this.maybeApiDefinition = await getApiDefinition(this.maybeApiDefinitionId);
            return this.maybeApiDefinition;
        }

        return;
    }

    // Get or create and cache ObjectFlattener
    private getObjectFlattener(apiDefinition: APIV1Read.ApiDefinition): ObjectFlattener {
        if (this.maybeObjectFlattener != null) {
            return this.maybeObjectFlattener;
        }

        this.maybeObjectFlattener = new ObjectFlattener(apiDefinition);
        return this.maybeObjectFlattener;
    }

    public async getTemplateResolver({
        payload,
        endpointSnippetTemplate,
    }: {
        payload: CustomSnippetPayload;
        endpointSnippetTemplate: EndpointSnippetTemplate;
    }): Promise<SnippetTemplateResolver> {
        const apiDefinition = await this.getApiDefinition();
        if (apiDefinition == null) {
            throw new Error("Failed to get API definition");
        }
        const objectFlattener = this.getObjectFlattener(apiDefinition);

        return new SnippetTemplateResolver({
            apiDefinition,
            objectFlattener,
            payload,
            endpointSnippetTemplate,
        });
    }

    public async resolveWithFormatting({
        payload,
        endpointSnippetTemplate,
    }: {
        payload: CustomSnippetPayload;
        endpointSnippetTemplate: EndpointSnippetTemplate;
    }): Promise<Snippet> {
        const resolver = await this.getTemplateResolver({ payload, endpointSnippetTemplate });

        return resolver.resolveWithFormatting();
    }

    public async resolve({
        payload,
        endpointSnippetTemplate,
    }: {
        payload: CustomSnippetPayload;
        endpointSnippetTemplate: EndpointSnippetTemplate;
    }): Promise<Snippet> {
        const resolver = await this.getTemplateResolver({ payload, endpointSnippetTemplate });

        return resolver.resolve();
    }
}
