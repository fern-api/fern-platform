import { CohereIcon } from "@fern-ui/chatbot";
import cn, { clsx } from "clsx";
import { useSetAtom } from "jotai";
import { ChevronRight } from "react-feather";
import { COHERE_ASK_AI, COHERE_INITIAL_MESSAGE, useCloseMobileSidebar, useCloseSearchDialog } from "../../atoms";

export declare namespace SearchHit {
    export interface Props {
        setRef?: (elem: HTMLAnchorElement | null) => void;
        message: string;
        isHovered?: boolean;
        onMouseEnter?: () => void;
        onMouseLeave?: () => void;
    }
}

export const AskCohereHit: React.FC<SearchHit.Props> = ({
    setRef,
    message,
    isHovered = false,
    onMouseEnter,
    onMouseLeave,
}) => {
    const closeMobileSidebar = useCloseMobileSidebar();
    const closeSearchDialog = useCloseSearchDialog();
    const setOpenCohere = useSetAtom(COHERE_ASK_AI);
    const setCohereInitialMessage = useSetAtom(COHERE_INITIAL_MESSAGE);

    const openCohere = () => {
        setCohereInitialMessage(`Can you tell me about ${message}?`);
        setOpenCohere(true);
    };

    return (
        <a
            ref={(elem) => setRef?.(elem)}
            className={cn("flex w-full items-center space-x-4 space-y-1 rounded-md px-3 py-2 cursor-pointer", {
                "bg-accent-highlight": isHovered,
            })}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={() => {
                closeMobileSidebar();
                closeSearchDialog();
                openCohere();
            }}
        >
            <div className="flex w-full items-center gap-4">
                <CohereIcon className="size-6" />
                <div className="flex flex-col w-full">
                    <div className="text-sm text-left">
                        Can you tell me about <span className="t-accent-aaa font-bold">{message}</span>?
                    </div>
                    <div className="text-xs text-faded text-left">Ask Cohere</div>
                </div>
                <ChevronRight
                    className={clsx("size-6", {
                        "text-accent": isHovered,
                        "text-faded": !isHovered,
                    })}
                />
            </div>
        </a>
    );
};
