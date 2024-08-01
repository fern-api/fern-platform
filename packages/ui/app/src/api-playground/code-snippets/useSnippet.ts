import { APIV1Read } from "@fern-api/fdr-sdk";
import { useEffect, useMemo, useState } from "react";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { resolveEnvironmentUrlInCodeSnippet } from "../../resolver/types";
import { getApiDefinition } from "./apiDefinitionCache";
import { PlaygroundCodeSnippetResolver } from "./resolver";

export function useSnippet(resolver: PlaygroundCodeSnippetResolver, lang: "curl" | "python" | "typescript"): string {
    const selectedEnvironmentId = useSelectedEnvironmentId();
    const [apiDefinition, setApiDefinition] = useState<APIV1Read.ApiDefinition>();

    useEffect(() => {
        void (async () => {
            setApiDefinition(await getApiDefinition(resolver.endpoint.apiDefinitionId));
        })();
    }, [resolver.endpoint.apiDefinitionId]);

    const code = useMemo(() => resolver.resolve(lang, apiDefinition), [resolver, lang, apiDefinition]);

    return resolveEnvironmentUrlInCodeSnippet(resolver.endpoint, code, selectedEnvironmentId);
}
