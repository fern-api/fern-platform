import { APIV1Read } from "@fern-api/fdr-sdk";
import { ResolvedEndpointDefinition } from "@fern-ui/app-utils";
import { FC } from "react";
import { FernSyntaxHighlighter } from "../commons/CodeBlockSkeleton";
import { FernScrollArea } from "../components/FernScrollArea";
import { PlaygroundRequestFormState } from "./types";
import { stringifyCurl, stringifyFetch, stringifyPythonRequests } from "./utils";

interface PlaygroundRequestPreviewProps {
    auth: APIV1Read.ApiAuth | undefined;
    endpoint: ResolvedEndpointDefinition | undefined;
    formState: PlaygroundRequestFormState;
    requestType: "curl" | "javascript" | "python";
}

export const PlaygroundRequestPreview: FC<PlaygroundRequestPreviewProps> = ({
    auth,
    endpoint,
    formState,
    requestType,
}) => {
    return (
        <div className="group relative flex-1">
            <FernScrollArea>
                <FernSyntaxHighlighter language={requestType === "curl" ? "shell" : requestType}>
                    {requestType === "curl"
                        ? stringifyCurl(auth, endpoint, formState)
                        : requestType === "javascript"
                          ? stringifyFetch(auth, endpoint, formState)
                          : requestType === "python"
                            ? stringifyPythonRequests(auth, endpoint, formState)
                            : ""}
                </FernSyntaxHighlighter>
            </FernScrollArea>
        </div>
    );
};
