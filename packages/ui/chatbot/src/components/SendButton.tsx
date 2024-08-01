import clsx from "clsx";
import { ComponentPropsWithRef, ReactElement } from "react";
import { SendIcon } from "../icons/SendIcon";

export function SendButton(props: ComponentPropsWithRef<"button">): ReactElement {
    return (
        <button
            {...props}
            className={clsx(
                "mb-1 me-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:outline-black dark:bg-white dark:text-black dark:focus-visible:outline-white disabled:bg-gray-a6 disabled:text-gray-3 dark:disabled:bg-gray-a6 dark:disabled:text-gray-5 disabled:hover:opacity-100",
                props.className,
            )}
        >
            <SendIcon className="icon-2xl" />
        </button>
    );
}
