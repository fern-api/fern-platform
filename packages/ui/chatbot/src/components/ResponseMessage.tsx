import { memo } from "react";
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
