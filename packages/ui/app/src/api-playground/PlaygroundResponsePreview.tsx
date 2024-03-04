import { FC, useMemo } from "react";
import { FernSyntaxHighlighter } from "../syntax-highlighting/FernSyntaxHighlighter";

interface PlaygroundResponsePreviewProps {
    responseBody: unknown;
}

export const PlaygroundResponsePreview: FC<PlaygroundResponsePreviewProps> = ({ responseBody }) => {
    const responseJson = useMemo(() => JSON.stringify(responseBody, null, 2), [responseBody]);
    return (
        <FernSyntaxHighlighter
            className="relative min-h-0 flex-1 shrink"
            language="json"
            code={responseJson}
            fontSize="sm"
        />
    );
};
