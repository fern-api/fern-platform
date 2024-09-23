import { visitDiscriminatedUnion } from "@fern-api/fdr-sdk";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { identity } from "@fern-ui/core-utils";
import { AsyncOrSync } from "ts-essentials";
import { serializeMdx } from "../mdx/bundler";
import { resolveCodeSnippets } from "./snippets";

interface Flags {
    useJavaScriptAsTypeScript: boolean;
    alwaysEnableJavaScriptFetch: boolean;
    usesApplicationJsonInFormDataValue: boolean;
    isHttpSnippetsEnabled: boolean;
}

/**
 * This function resolves the ApiDefinition by
 * 1. converting api definitions to the format expected by the UI
 * 2. resolving all descriptions via serializeMdx (+ files for mdx-bundler, however this is not tested)
 */
export function resolveApiDefinition(
    api: ApiDefinition.ApiDefinition,
    flags: Flags,
    files?: Record<string, string>,
): Promise<ApiDefinition.ApiDefinition> {
    // const api = ApiDefinition.convertApiDefinition(collector, holder, flags);

    return ApiDefinition.visitApiDefinition(api, {
        /**
         * Special case for EndpointDefinition
         */
        EndpointDefinition: createResolveEndpointDefinition(api.auth, flags, files),

        /**
         * The following types are expected to have descriptions
         */

        Parameter: createResolveWithDescription(files),
        HttpRequest: createResolveWithDescription(files),
        HttpResponse: createResolveWithDescription(files),
        WebSocketChannel: createResolveWithDescription(files),
        WebhookDefinition: createResolveWithDescription(files),
        TypeDefinition: createResolveWithDescription(files),
        ErrorResponse: createResolveWithDescription(files),
        ExampleEndpointCall: createResolveWithDescription(files),
        CodeSnippet: createResolveWithDescription(files),
        ErrorExample: createResolveWithDescription(files),
        WebhookPayload: createResolveWithDescription(files),
        WebSocketMessage: createResolveWithDescription(files),
        ExampleWebSocketSession: createResolveWithDescription(files),
        ObjectProperty: createResolveWithDescription(files),
        EnumValue: createResolveWithDescription(files),
        UndiscriminatedUnionVariant: createResolveWithDescription(files),
        DiscriminatedUnionVariant: createResolveWithDescription(files),
        FormDataRequest: createResolveWithDescription(files),
        FormDataField: createResolveWithDescription(files),
        FormDataFile: createResolveWithDescription(files),
        FormDataFiles: createResolveWithDescription(files),

        /**
         * The following types are not expected to have descriptions
         */

        TypeShape: identity,
        ObjectType: identity,
    });
}

function createResolveEndpointDefinition(
    auth: ApiDefinition.ApiDefinition["auth"] | undefined,
    flags: Flags,
    files?: Record<string, string>,
): (endpoint: ApiDefinition.EndpointDefinition) => Promise<ApiDefinition.EndpointDefinition> {
    return async (endpoint: ApiDefinition.EndpointDefinition): Promise<ApiDefinition.EndpointDefinition> => {
        const resolvedPromise = createResolveWithDescription<ApiDefinition.EndpointDefinition>(files)(endpoint);
        if (!flags.isHttpSnippetsEnabled) {
            return resolvedPromise;
        } else {
            const examplesPromise = resolveExamples(endpoint, endpoint.examples, auth, flags);
            const [resolved, examples] = await Promise.all([resolvedPromise, examplesPromise]);
            return { ...resolved, examples };
        }
    };
}

function resolveExamples(
    endpoint: ApiDefinition.EndpointDefinition,
    examples: ApiDefinition.ExampleEndpointCall[],
    auth: ApiDefinition.ApiDefinition["auth"] | undefined,
    flags: Flags,
): Promise<ApiDefinition.ExampleEndpointCall[]> {
    return Promise.all(
        examples.map(async (example) => {
            const httpSnippets = await resolveCodeSnippets(endpoint, example, auth, flags.alwaysEnableJavaScriptFetch);
            const snippets = [...example.snippets, ...httpSnippets];
            return { ...example, snippets };
        }),
    );
}

function createResolveWithDescription<T extends ApiDefinition.WithDescription>(
    files?: Record<string, string>,
): (obj: T) => Promise<T> {
    return async function (obj: T): Promise<T> {
        return {
            ...obj,
            description: obj.description != null ? await resolveDescription(obj.description, files) : undefined,
        } satisfies T;
    };
}

async function resolveDescription(
    description: ApiDefinition.Description,
    files?: Record<string, string>,
): Promise<ApiDefinition.Description> {
    return visitDiscriminatedUnion(description)._visit<AsyncOrSync<ApiDefinition.Description>>({
        unresolved: async (value: ApiDefinition.Description.Unresolved) => {
            const mdx = await serializeMdx(value.value, { files });
            if (typeof mdx === "string") {
                return { type: "unresolved", value: value.value };
            }
            return {
                type: "resolved",
                engine: mdx.engine,
                code: mdx.code,
                frontmatter: mdx.frontmatter,
            };
        },
        resolved: (value) => {
            // This should never happen in the current implementation
            // but, we might need this in the future when we cache resolved descriptions incrementally

            // eslint-disable-next-line no-console
            console.error(`Unexpected resolved description: ${JSON.stringify(value)}`);
            return value;
        },
    });
}
