import { useAsync } from "react-use";
import type { AsyncState } from "react-use/lib/useAsyncFn";
import { PlaygroundCodeSnippetResolver } from "./resolver";
import { useApiDefinition } from "./useApiDefinition";

export function useSnippet(
    resolver: PlaygroundCodeSnippetResolver,
    lang: "curl" | "python" | "typescript",
): AsyncState<string> {
    const apiDefinition = useApiDefinition(resolver.context.node.apiDefinitionId, resolver.isSnippetTemplatesEnabled);

    // Resolve the code snippet
    return useAsync(() => resolver.resolve(lang, apiDefinition), [resolver, lang, apiDefinition]);
}
