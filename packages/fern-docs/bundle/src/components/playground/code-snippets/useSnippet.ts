import { useMemo } from "react";

import { PlaygroundCodeSnippetResolver } from "./resolver";
import { useApiDefinition } from "./useApiDefinition";

export function useSnippet(
  resolver: PlaygroundCodeSnippetResolver,
  lang: "curl" | "python" | "typescript"
): string {
  const apiDefinition = useApiDefinition(
    resolver.context.node.apiDefinitionId,
    resolver.isSnippetTemplatesEnabled
  );

  // Resolve the code snippet
  return useMemo(
    () => resolver.resolve(lang, apiDefinition),
    [resolver, lang, apiDefinition]
  );
}
