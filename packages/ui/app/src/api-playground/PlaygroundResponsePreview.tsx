import { FC, useMemo } from "react";
import { FernSyntaxHighlighter } from "../syntax-highlighting/FernSyntaxHighlighter";

interface PlaygroundResponsePreviewProps {
    responseBody: unknown;
    type: "json" | "stream";
}

export const PlaygroundResponsePreview: FC<PlaygroundResponsePreviewProps> = ({ responseBody, type }) => {
    const responseJson = useMemo(
        () =>
            type === "stream" && Array.isArray(responseBody)
                ? responseBody
                      .map((chunk) => (typeof chunk !== "string" ? JSON.stringify(chunk) : chunk.trim()))
                      .join("\n")
                : JSON.stringify(responseBody, null, 2),
        [responseBody, type],
    );
    return (
        <FernSyntaxHighlighter
            className="relative min-h-0 flex-1 shrink"
            language="json"
            code={responseJson}
            fontSize="sm"
        />
    );
};
