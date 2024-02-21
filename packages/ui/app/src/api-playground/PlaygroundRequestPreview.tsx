import { APIV1Read } from "@fern-api/fdr-sdk";
import dynamic from "next/dynamic";
import { FC } from "react";
import { FernScrollArea } from "../components/FernScrollArea";
import { ResolvedEndpointDefinition } from "../util/resolver";
import { PlaygroundRequestFormState } from "./types";
import { stringifyCurl, stringifyFetch, stringifyPythonRequests } from "./utils";

const FernSyntaxHighlighter = dynamic(
    () => import("../commons/CodeBlockSkeleton").then(({ FernSyntaxHighlighter }) => FernSyntaxHighlighter),
    { ssr: true },
);

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
        <div className="group relative min-h-0 flex-1 shrink">
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
