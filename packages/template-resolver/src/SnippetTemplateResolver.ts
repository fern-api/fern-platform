import { accessByPath } from "./accessByPath";
import {
    AuthPayload,
    CustomSnippetPayload,
    EndpointSnippetTemplate,
    ParameterPayload,
    PayloadInput,
    Sdk,
    Snippet,
    SnippetTemplate,
    Template,
    VersionedSnippetTemplate,
} from "./generated/api";
import { isPlainObject } from "./isPlainObject";

interface V1Snippet {
    imports: string[];
    invocation: string;
}
class DefaultedV1Snippet {
    public snippet: V1Snippet | undefined;

    constructor({
        template,
        isRequired,
        imports,
        invocation,
    }: {
        template: Template;
        imports?: string[];
        isRequired?: boolean;
        invocation?: string;
    }) {
        if (invocation != null) {
            this.snippet = { imports: imports ?? [], invocation };
            return;
        }

        let defaulted_invocation;
        switch (template.type) {
            case "generic":
            case "discriminatedUnion":
            case "union":
            case "enum":
                defaulted_invocation = template.templateString?.replace(TemplateSentinel, "") ?? "";
                break;
            case "dict":
                defaulted_invocation = "{}";
                break;
            case "iterable":
                defaulted_invocation = template.containerTemplateString.replace(TemplateSentinel, "");
                break;
        }

        this.snippet = isRequired
            ? {
                  imports: imports ?? template.imports ?? [],
                  invocation: defaulted_invocation,
              }
            : undefined;
    }
}

const TemplateSentinel = "$FERN_INPUT";

export class SnippetTemplateResolver {
    private payload: CustomSnippetPayload;
    private endpointSnippetTemplate: EndpointSnippetTemplate;

    constructor({
        payload,
        endpointSnippetTemplate,
    }: {
        payload: CustomSnippetPayload;
        endpointSnippetTemplate: EndpointSnippetTemplate;
    }) {
        this.payload = payload;
        this.endpointSnippetTemplate = endpointSnippetTemplate;
    }

    private accessByPath(jsonObject: unknown, path?: string | string[]): unknown {
        if (path != null && jsonObject != null && path.length > 0) {
            return accessByPath(jsonObject, path);
        }
        return jsonObject;
    }

    private accessParameterPayloadByPath(
        parameterPayloads?: ParameterPayload[],
        locationPath?: string,
    ): unknown | undefined {
        const splitPath = locationPath?.split(".") ?? [];
        const parameterName = splitPath.shift();

        if (parameterName != null && parameterPayloads != null) {
            const selectedParameter = parameterPayloads.find((parameter) => parameter.name === parameterName);
            if (selectedParameter != null) {
                return this.accessByPath(selectedParameter.value, splitPath);
            }
        }
        // Could not find the named parameter for this example.
        return undefined;
    }

    private accessAuthPayloadByPath(authPayload?: AuthPayload, locationPath?: string): unknown {
        if (authPayload != null) {
            return this.accessByPath(authPayload, locationPath);
        }
        const maybePayloadName = locationPath?.replace(/\[.*?\]/g, "")?.split(".")[0];

        return `YOUR_${(maybePayloadName ?? "variable").toUpperCase()}`;
    }

    private getPayloadValue(location: PayloadInput, payloadOverride?: unknown): unknown | undefined {
        if (location.location === "RELATIVE" && payloadOverride != null) {
            return this.accessByPath(payloadOverride, location.path);
        }

        switch (location.location) {
            case "BODY":
                return this.accessByPath(this.payload.requestBody, location.path);
            case "RELATIVE":
                // We should warn if this ever happens, the relative directive should only really happen within containers
                return this.accessByPath(this.payload.requestBody, location.path);
            case "QUERY":
                return this.accessParameterPayloadByPath(this.payload.queryParameters, location.path);
            case "PATH":
                return this.accessParameterPayloadByPath(this.payload.pathParameters, location.path);
            case "HEADERS":
                return this.accessParameterPayloadByPath(this.payload.headers, location.path);
            case "AUTH":
                return this.accessAuthPayloadByPath(this.payload.auth, location.path);
            default:
                throw new Error(`Unknown payload input type: ${location.location}`);
        }
    }

    private resolveV1Template({
        template,
        payloadOverride,
        isRequired,
    }: {
        template: Template;
        payloadOverride?: unknown;
        isRequired?: boolean;
    }): DefaultedV1Snippet {
        const imports: string[] = template.imports ?? [];
        switch (template.type) {
            case "generic": {
                if (template.templateInputs == null || template.templateInputs.length === 0) {
                    // TODO: If the field is required return SOMETHING, ideally from the default example
                    return new DefaultedV1Snippet({ template, isRequired });
                }
                const evaluatedInputs: V1Snippet[] = [];
                for (const input of template.templateInputs) {
                    if (input.type === "payload") {
                        const evaluatedPayload = this.getPayloadValue(input, payloadOverride);
                        if (evaluatedPayload != null) {
                            evaluatedInputs.push({
                                imports,
                                invocation: JSON.stringify(evaluatedPayload),
                            });
                        }
                    } else {
                        if (payloadOverride == null && input.value.isOptional && input.value.type === "enum") {
                            continue;
                        }

                        const evaluatedInput = this.resolveV1Template({
                            template: input.value,
                            payloadOverride,
                        }).snippet;
                        if (evaluatedInput != null) {
                            evaluatedInputs.push(evaluatedInput);
                        }
                    }
                }
                if (evaluatedInputs.length === 0) {
                    return new DefaultedV1Snippet({ template, isRequired });
                }
                return new DefaultedV1Snippet({
                    template,
                    isRequired,
                    imports: imports.concat(evaluatedInputs.flatMap((input) => input.imports)),
                    invocation: template.templateString.replace(
                        // TODO: fix the typescript generator to create literals not as types
                        TemplateSentinel,
                        evaluatedInputs.map((input) => input.invocation).join(template.inputDelimiter ?? ", "),
                    ),
                });
            }
            case "iterable": {
                if (template.templateInput == null) {
                    return new DefaultedV1Snippet({ template, isRequired });
                }
                const payloadValue = this.getPayloadValue(template.templateInput);
                if (!Array.isArray(payloadValue)) {
                    return new DefaultedV1Snippet({ template, isRequired });
                }

                const evaluatedInputs: V1Snippet[] = [];
                for (const value of payloadValue) {
                    const evaluatedInput = this.resolveV1Template({
                        template: template.innerTemplate,
                        payloadOverride: value,
                    }).snippet;
                    if (evaluatedInput != null) {
                        evaluatedInputs.push(evaluatedInput);
                    }
                }
                return new DefaultedV1Snippet({
                    template,
                    isRequired,
                    imports: imports.concat(evaluatedInputs.flatMap((input) => input.imports)),
                    invocation: template.containerTemplateString.replace(
                        TemplateSentinel,
                        evaluatedInputs.map((input) => input.invocation).join(template.delimiter ?? ", "),
                    ),
                });
            }
            case "dict": {
                if (template.templateInput == null) {
                    return new DefaultedV1Snippet({ template, isRequired });
                }
                const payloadValue = this.getPayloadValue(template.templateInput, payloadOverride);
                if (payloadValue == null || Array.isArray(payloadValue) || typeof payloadValue !== "object") {
                    return new DefaultedV1Snippet({ template, isRequired });
                }

                // const payloadMap = payloadValue as Map<string, unknown>;
                const evaluatedInputs: V1Snippet[] = [];
                for (const key in payloadValue) {
                    const value = payloadValue[key as keyof typeof payloadValue];
                    const keySnippet = this.resolveV1Template({
                        template: template.keyTemplate,
                        payloadOverride: key,
                    }).snippet;
                    const valueSnippet = this.resolveV1Template({
                        template: template.valueTemplate,
                        payloadOverride: value,
                    }).snippet;
                    if (keySnippet != null && valueSnippet != null) {
                        evaluatedInputs.push({
                            imports: keySnippet.imports.concat(valueSnippet.imports),
                            invocation: `${keySnippet.invocation}${template.keyValueSeparator}${valueSnippet.invocation}`,
                        });
                    }
                }
                return new DefaultedV1Snippet({
                    template,
                    isRequired,
                    imports: imports.concat(evaluatedInputs.flatMap((input) => input.imports)),
                    invocation: template.containerTemplateString.replace(
                        TemplateSentinel,
                        evaluatedInputs.map((input) => input.invocation).join(template.delimiter ?? ", "),
                    ),
                });
            }
            case "enum": {
                const enumValues = template.values;
                const enumSdkValues = Object.values(template.values);
                const defaultEnumValue = enumSdkValues[0];
                if (template.templateInput == null || defaultEnumValue == null) {
                    return new DefaultedV1Snippet({ template, isRequired });
                }
                const maybeEnumWireValue = this.getPayloadValue(template.templateInput, payloadOverride);
                const enumSdkValue =
                    (typeof maybeEnumWireValue === "string" ? enumValues[maybeEnumWireValue] : undefined) ??
                    defaultEnumValue;
                return new DefaultedV1Snippet({
                    template,
                    isRequired,
                    imports,
                    invocation: template.templateString?.replace(TemplateSentinel, enumSdkValue) ?? enumSdkValue,
                });
            }
            case "discriminatedUnion": {
                const unionMembers = template.members;
                const discriminator = template.discriminantField;

                const maybeUnionValue = this.getPayloadValue(
                    // Defaults to relative since the python generator didn't specify this on historical templates
                    template.templateInput ?? { location: "RELATIVE" },
                    payloadOverride,
                );
                if (maybeUnionValue == null || !isPlainObject(maybeUnionValue) || !(discriminator in maybeUnionValue)) {
                    return new DefaultedV1Snippet({ template, isRequired });
                }

                const discriminatorValue = maybeUnionValue[discriminator];
                if (typeof discriminatorValue !== "string") {
                    return new DefaultedV1Snippet({ template, isRequired });
                }

                const selectedMemberTemplate = unionMembers[discriminatorValue];

                if (!selectedMemberTemplate) {
                    return new DefaultedV1Snippet({ template, isRequired });
                }

                const evaluatedMember: V1Snippet | undefined = this.resolveV1Template({
                    template: selectedMemberTemplate,
                    payloadOverride,
                }).snippet;
                if (evaluatedMember == null) {
                    return new DefaultedV1Snippet({ template, isRequired });
                }

                return new DefaultedV1Snippet({
                    template,
                    isRequired,
                    imports: imports.concat(evaluatedMember.imports),
                    invocation: template.templateString.replace(TemplateSentinel, evaluatedMember.invocation),
                });
            }
            case "union":
                // TODO: evaluate the shape of the object, compared against the union members to select
                // the closest fit, evaluate and return that. This is what the ApiDefinition is for.
                return new DefaultedV1Snippet({ template, isRequired });
        }
    }

    private resolveSnippetV1TemplateString(template: SnippetTemplate): string {
        const clientSnippet =
            typeof template.clientInstantiation === "string"
                ? template.clientInstantiation
                : this.resolveV1Template({ template: template.clientInstantiation, isRequired: true }).snippet;

        const endpointSnippet = this.resolveV1Template({
            template: template.functionInvocation,
            isRequired: true,
        }).snippet;

        // TODO: We should split the Snippet data model to return these independently
        // so there's more flexibility on the consumer end to decide how to use them.
        const dedupedImports = new Set();
        if (typeof clientSnippet !== "string") {
            clientSnippet?.imports.forEach((value) => {
                dedupedImports.add(value);
            });
        }
        endpointSnippet?.imports.forEach((value) => {
            dedupedImports.add(value);
        });

        return `${[...dedupedImports].join("\n")}

${typeof clientSnippet === "string" ? clientSnippet : clientSnippet?.invocation}        
${endpointSnippet?.invocation}
`;
    }

    private resolveSnippetV1TemplateToSnippet(sdk: Sdk, template: SnippetTemplate): Snippet {
        const snippet = this.resolveSnippetV1TemplateString(template);

        switch (sdk.type) {
            case "typescript":
                return { type: "typescript", sdk, client: snippet };
            case "python":
                return {
                    type: "python",
                    sdk,
                    sync_client: snippet,
                    async_client: this.resolveAdditionalTemplate("async") ?? snippet,
                };
            case "java":
                return {
                    type: "java",
                    sdk,
                    sync_client: snippet,
                    async_client: this.resolveAdditionalTemplate("async") ?? snippet,
                };
            case "go":
                return { type: "go", sdk, client: snippet };
            case "ruby":
                return { type: "ruby", sdk, client: snippet };
            default:
                throw new Error("Encountered unexpected SDK type in snippet generation, failing hard.");
        }
    }

    public resolve(): Snippet {
        const sdk: Sdk = this.endpointSnippetTemplate.sdk;
        const template: VersionedSnippetTemplate = this.endpointSnippetTemplate.snippetTemplate;
        switch (template.type) {
            case "v1":
                return this.resolveSnippetV1TemplateToSnippet(sdk, template);
            default:
                throw new Error(`Unknown template version: ${template.type}`);
        }
    }

    public async resolveWithFormatting(): Promise<Snippet> {
        const { formatSnippet } = await import("./formatSnippet");
        const sdk: Sdk = this.endpointSnippetTemplate.sdk;
        const template: VersionedSnippetTemplate = this.endpointSnippetTemplate.snippetTemplate;
        switch (template.type) {
            case "v1":
                return await formatSnippet(this.resolveSnippetV1TemplateToSnippet(sdk, template));
            default:
                throw new Error(`Unknown template version: ${template.type}`);
        }
    }

    public resolveAdditionalTemplate(key: string): string | undefined {
        const template: VersionedSnippetTemplate | undefined =
            this.endpointSnippetTemplate.additionalTemplates != null
                ? this.endpointSnippetTemplate.additionalTemplates[key]
                : undefined;
        if (template != null) {
            switch (template.type) {
                case "v1":
                    return this.resolveSnippetV1TemplateString(template);
                default:
                    throw new Error(`Unknown template version: ${template.type}`);
            }
        }
        return undefined;
    }
}
