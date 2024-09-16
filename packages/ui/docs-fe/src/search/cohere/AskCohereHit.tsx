import { CohereIcon } from "@fern-ui/chatbot";
import cn, { clsx } from "clsx";
import { NavArrowRight } from "iconoir-react";
import { useSetAtom } from "jotai";
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
            className={clsx("flex w-full cursor-pointer items-center space-x-4 space-y-1 rounded-md px-3 py-2", {
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
            <div className="flex w-full items-center gap-3">
                <CohereIcon className="size-6" />
                <div className="flex w-full flex-col">
                    <div className="text-left text-sm">
                        Can you tell me about <span className="t-accent-aaa font-bold">{message}</span>?
                    </div>
                    <div className="text-faded text-left text-xs">Ask Cohere</div>
                </div>
                <NavArrowRight
                    className={clsx("size-6", {
                        "text-accent": isHovered,
                        "text-faded": !isHovered,
                    })}
                />
            </div>
        </a>
    );
};
