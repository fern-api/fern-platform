import type { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { useAtom, useAtomValue } from "jotai";
import { FC, useMemo } from "react";
import { PLAYGROUND_AUTH_STATE_ATOM, PLAYGROUND_AUTH_STATE_OAUTH_ATOM, useFeatureFlags } from "../atoms";
import { useStandardProxyEnvironment } from "../hooks/useStandardProxyEnvironment";
import { FernSyntaxHighlighter } from "../syntax-highlighting/FernSyntaxHighlighter";
import { PlaygroundCodeSnippetResolverBuilder } from "./code-snippets/resolver";
import { useSnippet } from "./code-snippets/useSnippet";
import { PlaygroundEndpointRequestFormState } from "./types";
import { usePlaygroundBaseUrl } from "./utils/select-environment";

interface PlaygroundRequestPreviewProps {
    context: EndpointContext;
    formState: PlaygroundEndpointRequestFormState;
    requestType: "curl" | "typescript" | "python";
}

export const PlaygroundRequestPreview: FC<PlaygroundRequestPreviewProps> = ({ context, formState, requestType }) => {
    const { isSnippetTemplatesEnabled } = useFeatureFlags();
    const authState = useAtomValue(PLAYGROUND_AUTH_STATE_ATOM);
    const { isFileForgeHackEnabled } = useFeatureFlags();
    const [oAuthValue, setOAuthValue] = useAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);
    const [baseUrl] = usePlaygroundBaseUrl(context.endpoint);

    const builder = useMemo(
        () => new PlaygroundCodeSnippetResolverBuilder(context, isSnippetTemplatesEnabled, isFileForgeHackEnabled),
        [context, isSnippetTemplatesEnabled, isFileForgeHackEnabled],
    );
    const proxyEnvironment = useStandardProxyEnvironment();

    const resolver = useMemo(
        () => oAuthValue && builder.createRedacted(authState, formState, proxyEnvironment, baseUrl, setOAuthValue),
        [authState, builder, formState, proxyEnvironment, oAuthValue, baseUrl, setOAuthValue],
    );
    const code = useSnippet(resolver, requestType);

    return (
        <FernSyntaxHighlighter
            className="relative min-h-0 flex-1 shrink"
            language={requestType === "curl" ? "bash" : requestType}
            // TODO: handle loading and error states
            code={code.value ?? ""}
            fontSize="sm"
            id={context.endpoint.id}
        />
    );
};
