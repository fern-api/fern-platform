import dynamic from "next/dynamic";
import { FC } from "react";
import { FernScrollArea } from "../components/FernScrollArea";

const FernSyntaxHighlighter = dynamic(
    () => import("../commons/CodeBlockSkeleton").then(({ FernSyntaxHighlighter }) => FernSyntaxHighlighter),
    { ssr: true },
);

interface PlaygroundResponsePreviewProps {
    responseBody: unknown;
}

export const PlaygroundResponsePreview: FC<PlaygroundResponsePreviewProps> = ({ responseBody }) => {
    const responseJson = JSON.stringify(responseBody, null, 2);
    return (
        <div className="group relative min-h-0 flex-1 shrink">
            <FernScrollArea>
                <FernSyntaxHighlighter language={"json"}>{responseJson}</FernSyntaxHighlighter>
            </FernScrollArea>
        </div>
    );
};
