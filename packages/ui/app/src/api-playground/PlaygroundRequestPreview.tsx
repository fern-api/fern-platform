import { FC, useMemo } from "react";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { ResolvedEndpointDefinition } from "../resolver/types";
import { FernSyntaxHighlighter } from "../syntax-highlighting/FernSyntaxHighlighter";
import { PlaygroundEndpointRequestFormState } from "./types";
import { stringifyCurl, stringifyFetch, stringifyPythonRequests } from "./utils";

interface PlaygroundRequestPreviewProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    requestType: "curl" | "javascript" | "python";
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
                : requestType === "javascript"
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
