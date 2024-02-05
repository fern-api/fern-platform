import classNames from "classnames";
import { useState } from "react";
import { CodeBlockSkeleton } from "../../commons/CodeBlockSkeleton";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import type { CodeBlockItem } from "./common/types";

export declare namespace _CodeBlocks {
    export interface Props {
        items: CodeBlockItem[];
    }
}

export const _CodeBlocks: React.FC<React.PropsWithChildren<_CodeBlocks.Props>> = ({ items }) => {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const codeBlockItem = items[selectedTabIndex];
    if (codeBlockItem == null) {
        return null;
    }
    return (
        <div className="bg-background-primary-light dark:bg-background-primary-dark border-border-default-light dark:border-border-default-dark mb-5 w-full min-w-0 max-w-full rounded-lg border">
            <div className="relative flex justify-between">
                <div className="border-border-default-light dark:border-border-default-dark absolute inset-x-0 bottom-0 z-0 border-b" />
                <div className="flex overflow-x-auto">
                    {items.length === 1 && items[0] != null ? (
                        <span className="inline-flex h-10 items-center px-3 text-sm font-semibold">
                            {items[0].title}
                        </span>
                    ) : (
                        items.map((item, idx) => (
                            <button
                                className={classNames(
                                    "group border-b-[2px] h-10 flex items-center px-2 transition text-sm",
                                    {
                                        "text-accent-primary border-accent-primary font-semibold":
                                            selectedTabIndex === idx,
                                        "text-text-primary-light dark:text-text-muted-dark border-transparent hover:text-accent-primary hover:dark:text-text-primary-dark":
                                            selectedTabIndex !== idx,
                                    },
                                )}
                                key={idx}
                                onClick={() => setSelectedTabIndex(idx)}
                                role="tablist"
                                aria-selected={selectedTabIndex === idx}
                            >
                                <span className="group-hover:bg-tag-default-light dark:group-hover:bg-tag-default-dark rounded p-1">
                                    {item.title}
                                </span>
                            </button>
                        ))
                    )}
                </div>

                <CopyToClipboardButton className="ml-auto mr-4" content={codeBlockItem.content} />
            </div>
            <CodeBlockSkeleton
                className="max-h-[500px] overflow-y-auto"
                language={codeBlockItem.language}
                content={codeBlockItem.content}
                fontSize="lg"
            />
        </div>
    );
};
