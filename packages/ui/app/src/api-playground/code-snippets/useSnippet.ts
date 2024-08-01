import { useMemo } from "react";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { resolveEnvironmentUrlInCodeSnippet } from "../../resolver/types";
import { useApiDefinition } from "./apiDefinitionCache";
import { PlaygroundCodeSnippetResolver } from "./resolver";

export function useSnippet(resolver: PlaygroundCodeSnippetResolver, lang: "curl" | "python" | "typescript"): string {
    const selectedEnvironmentId = useSelectedEnvironmentId();
    const apiDefinition = useApiDefinition(resolver.endpoint.apiDefinitionId);

    // Resolve the code snippet
    const code = useMemo(() => resolver.resolve(lang, apiDefinition), [resolver, lang, apiDefinition]);
    return resolveEnvironmentUrlInCodeSnippet(resolver.endpoint, code, selectedEnvironmentId);
}
