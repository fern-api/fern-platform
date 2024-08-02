import { memo } from "react";
import { MarkdownContent } from "./MarkdownContent";

export const UserMessage = memo(({ message }: { message: string }) => {
    return (
        <div className="flex gap-2 justify-end">
            <div className="relative max-w-[75%] rounded-3xl bg-grayscale-a3 px-5 py-2.5">
                <MarkdownContent className="leading-normal">{message}</MarkdownContent>
            </div>
        </div>
    );
});
