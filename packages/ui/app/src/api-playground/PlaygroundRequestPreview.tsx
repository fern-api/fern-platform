import { FC, useMemo } from "react";
import { useFeatureFlags } from "../contexts/FeatureFlagContext.js";
import { useDocsContext } from "../contexts/docs-context/useDocsContext.js";
import { ResolvedEndpointDefinition } from "../resolver/types.js";
import { FernSyntaxHighlighter } from "../syntax-highlighting/FernSyntaxHighlighter.js";
import { PlaygroundEndpointRequestFormState } from "./types.js";
import { stringifyCurl, stringifyFetch, stringifyPythonRequests } from "./utils.js";

interface PlaygroundRequestPreviewProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    requestType: "curl" | "typescript" | "python";
}

export const PlaygroundRequestPreview: FC<PlaygroundRequestPreviewProps> = ({ endpoint, formState, requestType }) => {
    const { isSnippetTemplatesEnabled } = useFeatureFlags();
    const { domain } = useDocsContext();
    const code = useMemo(
        () =>
            requestType === "curl"
                ? stringifyCurl({
                      endpoint,
                      formState,
                      redacted: true,
                      domain,
                  })
                : requestType === "typescript"
                  ? stringifyFetch({
                        endpoint,
                        formState,
                        redacted: true,
                        isSnippetTemplatesEnabled,
                    })
                  : requestType === "python"
                    ? stringifyPythonRequests({
                          endpoint,
                          formState,
                          redacted: true,
                          isSnippetTemplatesEnabled,
                      })
                    : "",
        [domain, endpoint, formState, isSnippetTemplatesEnabled, requestType],
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
