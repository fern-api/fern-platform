import { APIV1Read } from "@fern-api/fdr-sdk";
import { FC, useMemo } from "react";
import { FernSyntaxHighlighter } from "../commons/FernSyntaxHighlighter";
import { ResolvedEndpointDefinition } from "../util/resolver";
import { PlaygroundEndpointRequestFormState } from "./types";
import { stringifyCurl, stringifyFetch, stringifyPythonRequests } from "./utils";

interface PlaygroundRequestPreviewProps {
    auth: APIV1Read.ApiAuth | null | undefined;
    endpoint: ResolvedEndpointDefinition | undefined;
    formState: PlaygroundEndpointRequestFormState;
    requestType: "curl" | "javascript" | "python";
}

export const PlaygroundRequestPreview: FC<PlaygroundRequestPreviewProps> = ({
    auth,
    endpoint,
    formState,
    requestType,
}) => {
    const code = useMemo(
        () =>
            requestType === "curl"
                ? stringifyCurl(auth, endpoint, formState)
                : requestType === "javascript"
                  ? stringifyFetch(auth, endpoint, formState)
                  : requestType === "python"
                    ? stringifyPythonRequests(auth, endpoint, formState)
                    : "",
        [auth, endpoint, formState, requestType],
    );
    return (
        <FernSyntaxHighlighter
            className="relative min-h-0 flex-1 shrink"
            language={requestType === "curl" ? "bash" : requestType}
            code={code}
            fontSize="sm"
        />
    );
};
