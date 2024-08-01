import { useEffect, useState } from "react";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { resolveEnvironmentUrlInCodeSnippet } from "../../resolver/types";
import { PlaygroundCodeSnippetResolver } from "./resolver";

export function useSnippet(resolver: PlaygroundCodeSnippetResolver, lang: "curl" | "python" | "typescript"): string {
    const selectedEnvironmentId = useSelectedEnvironmentId();
    const [code, setCode] = useState<string>(() => resolver.resolveSync(lang));

    useEffect(() => {
        void (async () => {
            setCode(await resolver.resolve(lang));
        })();
    }, [lang, resolver]);

    return resolveEnvironmentUrlInCodeSnippet(resolver.endpoint, code, selectedEnvironmentId);
}
