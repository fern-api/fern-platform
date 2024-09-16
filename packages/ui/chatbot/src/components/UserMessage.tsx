import { memo } from "react";
import { MarkdownContent } from "./MarkdownContent";

export const UserMessage = memo(({ message }: { message: string }) => {
    return (
        <div className="flex justify-end gap-2">
            <div className="bg-grayscale-a3 relative max-w-[75%] rounded-3xl px-5 py-2.5">
                <MarkdownContent className="leading-normal">{message}</MarkdownContent>
            </div>
        </div>
    );
});
