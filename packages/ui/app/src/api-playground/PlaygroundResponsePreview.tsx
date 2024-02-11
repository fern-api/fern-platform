import { FC } from "react";
import { FernSyntaxHighlighter } from "../commons/CodeBlockSkeleton";
import { CopyToClipboardButton } from "../commons/CopyToClipboardButton";

interface PlaygroundResponsePreviewProps {
    responseBody: unknown;
}

export const PlaygroundResponsePreview: FC<PlaygroundResponsePreviewProps> = ({ responseBody }) => {
    const responseJson = JSON.stringify(responseBody, null, 2);
    return (
        <div className="group relative h-full flex-1">
            <CopyToClipboardButton
                className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
                content={responseJson}
            />
            <div className="h-full overflow-auto font-mono text-xs">
                <FernSyntaxHighlighter language={"json"} showLineNumbers={true} customStyle={{ padding: 0 }}>
                    {responseJson}
                </FernSyntaxHighlighter>
            </div>
        </div>
    );
};
