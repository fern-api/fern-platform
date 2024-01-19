import { APIV1Read } from "@fern-api/fdr-sdk";
import { ResolvedEndpointDefinition } from "@fern-ui/app-utils";
import { useTheme } from "next-themes";
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
    const { resolvedTheme: theme } = useTheme();
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
            <div className="typography-font-code h-full overflow-auto text-xs">
                <FernSyntaxHighlighter
                    language={requestType === "curl" ? "shell" : requestType}
                    customStyle={{ height: "100%", paddingLeft: 0 }}
                    showLineNumbers={true}
                    lineNumberStyle={{
                        position: "sticky",
                        left: 0,
                        // paddingLeft: 8,
                        backgroundColor: theme === "dark" ? "rgb(var(--background-dark))" : "rgb(var(--background))",
                    }}
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
