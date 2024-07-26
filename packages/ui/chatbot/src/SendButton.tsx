import clsx from "clsx";
import { ComponentPropsWithRef, ReactElement } from "react";
import { SendIcon } from "./SendIcon";

export function SendButton(props: ComponentPropsWithRef<"button">): ReactElement {
    return (
        <button
            {...props}
            className={clsx(
                "mb-1 me-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:outline-black disabled:bg-[#D7D7D7] disabled:text-[#f4f4f4] disabled:hover:opacity-100 dark:bg-white dark:text-black dark:focus-visible:outline-white disabled:dark:bg-token-text-quaternary dark:disabled:text-token-main-surface-secondary",
                props.className,
            )}
        >
            <SendIcon className="icon-2xl" />
        </button>
    );
}
