import { EndpointDefinition } from "@fern-api/fdr-sdk/api-definition";
import { useMemo } from "react";
import { usePlaygroundBaseUrl } from "../utils/select-environment";
import { PlaygroundCodeSnippetResolver } from "./resolver";
import { useApiDefinition } from "./useApiDefinition";

export const resolveEnvironmentUrlInCodeSnippet = (
    endpoint: EndpointDefinition,
    replacementBaseUrl: string | undefined,
    requestCodeSnippet: string,
): string => {
    const urlToReplace = endpoint.environments?.find((env) => requestCodeSnippet.includes(env.baseUrl))?.baseUrl;
    return urlToReplace && replacementBaseUrl
        ? requestCodeSnippet.replace(urlToReplace, replacementBaseUrl)
        : requestCodeSnippet;
};

export function useSnippet(resolver: PlaygroundCodeSnippetResolver, lang: "curl" | "python" | "typescript"): string {
    const apiDefinition = useApiDefinition(resolver.context.node.apiDefinitionId, resolver.isSnippetTemplatesEnabled);
    const baseUrl = usePlaygroundBaseUrl(resolver.context.endpoint);

    // Resolve the code snippet
    const code = useMemo(() => resolver.resolve(lang, apiDefinition), [resolver, lang, apiDefinition]);
    return resolveEnvironmentUrlInCodeSnippet(resolver.context.endpoint, baseUrl, code);
}
