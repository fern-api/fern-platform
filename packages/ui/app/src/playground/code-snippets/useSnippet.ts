import { useMemo } from "react";
import { usePlaygroundEnvironment } from "../../atoms";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { resolveEnvironmentUrlInCodeSnippet } from "../../resolver/types";
import { PlaygroundCodeSnippetResolver } from "./resolver";
import { useApiDefinition } from "./useApiDefinition";

export function useSnippet(resolver: PlaygroundCodeSnippetResolver, lang: "curl" | "python" | "typescript"): string {
    const selectedEnvironmentId = useSelectedEnvironmentId();
    const playgroundEnvironment = usePlaygroundEnvironment();
    const apiDefinition = useApiDefinition(resolver.endpoint.apiDefinitionId, resolver.isSnippetTemplatesEnabled);

    // Resolve the code snippet
    const code = useMemo(() => resolver.resolve(lang, apiDefinition), [resolver, lang, apiDefinition]);
    return resolveEnvironmentUrlInCodeSnippet(resolver.endpoint, code, playgroundEnvironment, selectedEnvironmentId);
}
