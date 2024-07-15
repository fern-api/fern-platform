import { useAtomValue } from "jotai";
import { FC, useMemo } from "react";
import { PLAYGROUND_AUTH_STATE_ATOM, useDomain, useFeatureFlags } from "../atoms";
import { ResolvedEndpointDefinition } from "../resolver/types";
import { FernSyntaxHighlighter } from "../syntax-highlighting/FernSyntaxHighlighter";
import { PlaygroundEndpointRequestFormState } from "./types";
import { stringifyCurl, stringifyFetch, stringifyPythonRequests } from "./utils";

interface PlaygroundRequestPreviewProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    requestType: "curl" | "typescript" | "python";
}

export const PlaygroundRequestPreview: FC<PlaygroundRequestPreviewProps> = ({ endpoint, formState, requestType }) => {
    const { isSnippetTemplatesEnabled } = useFeatureFlags();
    const authState = useAtomValue(PLAYGROUND_AUTH_STATE_ATOM);
    const domain = useDomain();
    const code = useMemo(
        () =>
            requestType === "curl"
                ? stringifyCurl({
                      endpoint,
                      formState,
                      authState,
                      redacted: true,
                      domain,
                  })
                : requestType === "typescript"
                  ? stringifyFetch({
                        endpoint,
                        formState,
                        authState,
                        redacted: true,
                        isSnippetTemplatesEnabled,
                    })
                  : requestType === "python"
                    ? stringifyPythonRequests({
                          endpoint,
                          formState,
                          authState,
                          redacted: true,
                          isSnippetTemplatesEnabled,
                      })
                    : "",
        [authState, domain, endpoint, formState, isSnippetTemplatesEnabled, requestType],
    );
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
