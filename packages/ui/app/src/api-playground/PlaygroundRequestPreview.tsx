import { APIV1Read } from "@fern-api/fdr-sdk";
import { ResolvedEndpointDefinition } from "@fern-ui/app-utils";
import { FC } from "react";
import { FernSyntaxHighlighter } from "../commons/CodeBlockSkeleton";
import { CopyToClipboardButton } from "../commons/CopyToClipboardButton";
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
        <div className="group relative h-full flex-1">
            <CopyToClipboardButton
                className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
                content={() =>
                    requestType === "curl"
                        ? stringifyCurl(auth, endpoint, formState, false)
                        : requestType === "javascript"
                          ? stringifyFetch(auth, endpoint, formState, false)
                          : requestType === "python"
                            ? stringifyPythonRequests(auth, endpoint, formState, false)
                            : ""
                }
            />
            <div className="h-full overflow-auto font-mono text-xs">
                <FernSyntaxHighlighter
                    language={requestType === "curl" ? "shell" : requestType}
                    showLineNumbers={true}
                    customStyle={{ padding: 0 }}
                >
                    {requestType === "curl"
                        ? stringifyCurl(auth, endpoint, formState)
                        : requestType === "javascript"
                          ? stringifyFetch(auth, endpoint, formState)
                          : requestType === "python"
                            ? stringifyPythonRequests(auth, endpoint, formState)
                            : ""}
                </FernSyntaxHighlighter>
            </div>
        </div>
    );
};
