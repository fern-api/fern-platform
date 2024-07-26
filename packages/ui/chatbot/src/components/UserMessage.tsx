import { memo } from "react";
import { MarkdownContent } from "./MarkdownContent";

export const UserMessage = memo(({ message }: { message: string }) => {
    return (
        <div className="flex gap-2 justify-end">
            <div className="relative max-w-[70%] rounded-3xl bg-[#f4f4f4] dark:bg-gray-900 px-5 py-2.5">
                <MarkdownContent>{message}</MarkdownContent>
            </div>
        </div>
    );
});
