import { memo } from "react";
import type { Components } from "react-markdown";
import { Citation } from "../types";
import { FernAvatar } from "./FernAvatar";
import { MarkdownContent } from "./MarkdownContent";

interface ResponseMessageProps {
    message: string;
    components?: Components;
}

export const ResponseMessage = memo(({ message, components }: ResponseMessageProps) => {
    return (
        <div className="flex flex-1 gap-4 text-base">
            <div className="flex-shrink-0">
                <FernAvatar />
            </div>
            <div>
                <MarkdownContent components={components}>{message}</MarkdownContent>
            </div>
        </div>
    );
});

interface ResponseMessageWithCitationsProps {
    isStreaming: boolean;
    message: string;
    citations: Citation[];
    components?: Components;
}

export const ResponseMessageWithCitations = ({
    isStreaming,
    message,
    citations,
    components,
}: ResponseMessageWithCitationsProps) => {
    if (message === "" && citations.length === 0 && !isStreaming) {
        return null;
    }

    let messageWithCitations = message;

    if (citations.length > 0) {
        messageWithCitations += "\n\n### References\n";
    }

    const paths: string[] = [];
    citations.forEach(({ slugs }) => {
        slugs.forEach((slug) => {
            if (!paths.includes(`/${slug}`)) {
                paths.push(`/${slug}`);
            }
        });
    });

    const i = 1;
    paths.forEach((path) => {
        messageWithCitations += `\n${i}. [${path}](${path})`;
    });

    return (
        <div className="flex flex-1 gap-4 text-base">
            <div className="flex-shrink-0">
                <FernAvatar />
            </div>
            <div className="flex flex-col gap-4 min-w-0 shrink pr-4">
                <MarkdownContent terminator={isStreaming} components={components}>
                    {messageWithCitations}
                </MarkdownContent>
            </div>
        </div>
    );
};
