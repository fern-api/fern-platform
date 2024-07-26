import { memo } from "react";
import { Citation } from "../types";
import { FernAvatar } from "./FernAvatar";
import { MarkdownContent } from "./MarkdownContent";

export const ResponseMessage = memo(({ message }: { message: string }) => {
    return (
        <div className="flex flex-1 gap-4 text-base">
            <div className="flex-shrink-0">
                <FernAvatar />
            </div>
            <div>
                <MarkdownContent>{message}</MarkdownContent>
            </div>
        </div>
    );
});

export const ResponseMessageWithCitations = ({ message, citations }: { message: string; citations: Citation[] }) => {
    if (message === "" && citations.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-1 gap-4 text-base">
            <div className="flex-shrink-0">
                <FernAvatar />
            </div>
            <div className="flex flex-col gap-4">
                <MarkdownContent>{message}</MarkdownContent>
                <div>
                    {citations.map((citation, index) => (
                        <div key={index} className="flex flex-col gap-2">
                            <div className="text-sm font-semibold">References:</div>
                            <ul className="list-disc pl-4">
                                {citation.documents.map((document, index) => (
                                    <li key={index}>
                                        <a
                                            href={document.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {document.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
