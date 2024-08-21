import { useAtomValue } from "jotai";
import { FC, useMemo } from "react";
import { PLAYGROUND_AUTH_STATE_ATOM, useFeatureFlags } from "../atoms";
import { ResolvedEndpointDefinition } from "../resolver/types";
import { FernSyntaxHighlighter } from "../syntax-highlighting/FernSyntaxHighlighter";
import { PlaygroundCodeSnippetResolverBuilder } from "./code-snippets/resolver";
import { useSnippet } from "./code-snippets/useSnippet";
import { PlaygroundEndpointRequestFormState } from "./types";

interface PlaygroundRequestPreviewProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    requestType: "curl" | "typescript" | "python";
}

export const PlaygroundRequestPreview: FC<PlaygroundRequestPreviewProps> = ({ endpoint, formState, requestType }) => {
    const { isSnippetTemplatesEnabled } = useFeatureFlags();
    const authState = useAtomValue(PLAYGROUND_AUTH_STATE_ATOM);
    const { isFileForgeHackEnabled } = useFeatureFlags();
    const builder = useMemo(
        () => new PlaygroundCodeSnippetResolverBuilder(endpoint, isSnippetTemplatesEnabled, isFileForgeHackEnabled),
        [endpoint, isSnippetTemplatesEnabled, isFileForgeHackEnabled],
    );
    const resolver = useMemo(() => builder.createRedacted(authState, formState), [authState, builder, formState]);
    const code = useSnippet(resolver, requestType);

    return (
        <FernSyntaxHighlighter
            className="relative min-h-0 flex-1 shrink"
            language={requestType === "curl" ? "bash" : requestType}
            code={code}
            fontSize="sm"
            id={endpoint.id}
        />
    );
};
