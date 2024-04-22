import lodash from "lodash";
import {
    CustomSnippetPayload,
    EndpointSnippetTemplate,
    ParameterPayload,
    PayloadInput,
    Sdk,
    Snippet,
    SnippetTemplate,
    Template,
    VersionedSnippetTemplate,
} from "../../api/generated/api";
import { ApiDefinition } from "../../api/generated/api/resources/api/resources/v1/resources/read";
const { get } = lodash;

interface V1Snippet {
    imports: string[];
    invocation: string;
}

const TemplateSentinel = "$FERN_INPUT";

export class SnippetTemplateResolver {
    private payload: CustomSnippetPayload;
    private endpointSnippetTemplate: EndpointSnippetTemplate;
    // TODO: This should actually be used in the future, specifically for union gen
    private apiDefinition?: ApiDefinition;
    constructor({
        payload,
        endpointSnippetTemplate,
        apiDefinition,
    }: {
        payload: CustomSnippetPayload;
        endpointSnippetTemplate: EndpointSnippetTemplate;
        apiDefinition?: ApiDefinition;
    }) {
        this.payload = payload;
        this.endpointSnippetTemplate = endpointSnippetTemplate;
        this.apiDefinition = apiDefinition;
    }

    private accessByPath(jsonObject: unknown, path?: string | string[]): unknown {
        return path != null && jsonObject != null ? get(jsonObject, path) : jsonObject;
    }

    private accessParameterPayloadByPath(
        parameterPayloads?: ParameterPayload[],
        locationPath?: string,
    ): unknown | undefined {
        const splitPath = locationPath?.split(".") ?? [];
        const parameterName = splitPath.shift();

        if (parameterName != null && parameterPayloads != null) {
            const selectedParameter = parameterPayloads.find((parameter) => parameter.name === locationPath);
            if (selectedParameter != null) {
                return this.accessByPath(selectedParameter.value, splitPath);
            }
        }
        // Could not find the named parameter for this example.
        return undefined;
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
            default:
                throw new Error(`Unknown payload input type: ${location.location}`);
        }
    }

    private resolveV1Template(template: Template, payloadOverride?: unknown): V1Snippet | undefined {
        const imports: string[] = template.imports ?? [];
        switch (template.type) {
            case "generic": {
                if (template.templateInputs == null || template.templateInputs.length == 0) {
                    // TODO: If the field is required return SOMETHING, ideally from the default example
                    return undefined;
                }
                const evaluatedInputs: V1Snippet[] = [];
                for (const input of template.templateInputs) {
                    if (input.type == "payload") {
                        const evaluatedPayload = this.getPayloadValue(input, payloadOverride);
                        if (evaluatedPayload != null) {
                            evaluatedInputs.push({
                                imports,
                                invocation: JSON.stringify(evaluatedPayload),
                            });
                        }
                    } else {
                        const evaluatedInput = this.resolveV1Template(input.value, payloadOverride);
                        if (evaluatedInput != null) {
                            evaluatedInputs.push(evaluatedInput);
                        }
                    }
                }
                return evaluatedInputs.length > 0
                    ? {
                          imports: imports.concat(evaluatedInputs.flatMap((input) => input.imports)),
                          invocation: template.templateString.replace(
                              // TODO: fix the typescript generator to create literals not as types
                              TemplateSentinel,
                              evaluatedInputs.map((input) => input.invocation).join(template.inputDelimiter ?? ", "),
                          ),
                      }
                    : undefined;
            }
            case "iterable": {
                if (template.templateInput == null) {
                    return undefined;
                }
                const payloadValue = this.getPayloadValue(template.templateInput);
                if (!Array.isArray(payloadValue)) {
                    return undefined;
                }

                const evaluatedInputs: V1Snippet[] = [];
                for (const value of payloadValue) {
                    const evaluatedInput = this.resolveV1Template(template.innerTemplate, value);
                    if (evaluatedInput != null) {
                        evaluatedInputs.push(evaluatedInput);
                    }
                }
                return {
                    imports: imports.concat(evaluatedInputs.flatMap((input) => input.imports)),
                    invocation: template.containerTemplateString.replace(
                        TemplateSentinel,
                        evaluatedInputs.map((input) => input.invocation).join(template.delimiter ?? ", "),
                    ),
                };
            }
            case "dict": {
                if (template.templateInput == null) {
                    return undefined;
                }
                const payloadValue = this.getPayloadValue(template.templateInput, payloadOverride);
                if (payloadValue == null || Array.isArray(payloadValue) || typeof payloadValue !== "object") {
                    return undefined;
                }

                // const payloadMap = payloadValue as Map<string, unknown>;
                const evaluatedInputs: V1Snippet[] = [];
                for (const key in payloadValue) {
                    const value = payloadValue[key as keyof typeof payloadValue];
                    const keySnippet = this.resolveV1Template(template.keyTemplate, key);
                    const valueSnippet = this.resolveV1Template(template.valueTemplate, value);
                    if (keySnippet != null && valueSnippet != null) {
                        evaluatedInputs.push({
                            imports: keySnippet.imports.concat(valueSnippet.imports),
                            invocation: `${keySnippet.invocation}${template.keyValueSeparator}${valueSnippet.invocation}`,
                        });
                    }
                }
                return {
                    imports: imports.concat(evaluatedInputs.flatMap((input) => input.imports)),
                    invocation: template.containerTemplateString.replace(
                        TemplateSentinel,
                        evaluatedInputs.map((input) => input.invocation).join(template.delimiter ?? ", "),
                    ),
                };
            }
            case "enum": {
                const enumValues = new Map(Object.entries(template.values));
                const enumSdkValues = Array.from(enumValues.values());
                const defaultEnumValue = enumSdkValues[0];
                if (template.templateInput == null) {
                    return undefined;
                }

                const maybeEnumWireValue = this.getPayloadValue(template.templateInput, payloadOverride);
                const enumSdkValue =
                    (typeof maybeEnumWireValue === "string"
                        ? enumValues.get(maybeEnumWireValue as string)
                        : undefined) ?? defaultEnumValue;
                return {
                    imports,
                    invocation: template.templateString?.replace(TemplateSentinel, enumSdkValue) ?? enumSdkValue,
                };
            }
            case "discriminatedUnion": {
                const unionMembers = template.members;
                const discriminator = template.discriminantField;

                if (template.templateInput == null) {
                    return undefined;
                }

                const maybeUnionValue = this.getPayloadValue(template.templateInput, payloadOverride);
                if (
                    maybeUnionValue == null ||
                    Array.isArray(maybeUnionValue) ||
                    typeof maybeUnionValue !== "object" ||
                    !(discriminator in maybeUnionValue)
                ) {
                    return undefined;
                }

                const unionMap = maybeUnionValue as Map<string, unknown>;
                const discriminatorValue = unionMap.get(discriminator) as string;
                const selectedMemberTemplate = new Map(Object.entries(unionMembers)).get(discriminatorValue);
                const evaluatedMember: V1Snippet | undefined = selectedMemberTemplate
                    ? this.resolveV1Template(selectedMemberTemplate, payloadOverride)
                    : undefined;
                return evaluatedMember != null
                    ? {
                          imports: imports.concat(evaluatedMember.imports),
                          invocation: template.templateString.replace(TemplateSentinel, evaluatedMember.invocation),
                      }
                    : undefined;
            }
            case "union":
                // TODO: evaluate the shape of the object, compared against the union members to select
                // the closest fit, evaluate and return that. This is what the ApiDefinition is for.
                return undefined;
        }
    }

    private resolveSnippetV1Template(sdk: Sdk, template: SnippetTemplate): Snippet {
        const clientSnippet = template.clientInstantiation;
        const endpointSnippet = this.resolveV1Template(template.functionInvocation);

        // TODO: We should split the Snippet data model to return these independently
        // so there's more flexibility on the consumer end to decide how to use them.
        const snippet = `${[...new Set(endpointSnippet?.imports ?? [])].join("\n")}\n\n${clientSnippet}\n${endpointSnippet?.invocation}`;

        switch (sdk.type) {
            case "typescript":
                return { type: "typescript", sdk, client: snippet };
            case "python":
                return {
                    type: "python",
                    sdk,
                    sync_client: snippet,
                    // TODO: Handle the async snippet as well
                    async_client: snippet,
                };
            case "java":
                return {
                    type: "java",
                    sdk,
                    sync_client: snippet,
                    // TODO: Handle the async snippet as well
                    async_client: snippet,
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
                return this.resolveSnippetV1Template(sdk, template);
            default:
                throw new Error(`Unknown template version: ${template.type}`);
        }
    }
}
