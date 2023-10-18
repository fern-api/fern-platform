import classNames from "classnames";
import { useState } from "react";
import { CodeBlockSkeleton } from "../../commons/CodeBlockSkeleton";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import { useDocsContext } from "../../docs-context/useDocsContext";
import type { CodeBlockItem } from "./common/types";

export declare namespace _CodeBlocks {
    export interface Props {
        items: CodeBlockItem[];
    }
}

export const _CodeBlocks: React.FC<React.PropsWithChildren<_CodeBlocks.Props>> = ({ items }) => {
    const { theme } = useDocsContext();
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const codeBlockItem = items[selectedTabIndex];
    if (codeBlockItem == null) {
        return null;
    }
    return (
        <div className="mb-5 w-full min-w-0 max-w-full">
            <div className="border-border-default-light dark:border-border-default-dark flex justify-between rounded-t-lg border bg-gray-200/90 dark:bg-[#19181C]">
                <div className="flex overflow-x-auto">
                    {items.map((item, idx) => (
                        <button
                            className={classNames("border-b py-2.5 px-4 transition text-xs", {
                                "text-accent-primary border-accent-primary": selectedTabIndex === idx,
                                "text-text-primary-light dark:text-text-muted-dark border-transparent hover:text-accent-primary hover:dark:text-text-primary-dark":
                                    selectedTabIndex !== idx,
                            })}
                            key={idx}
                            onClick={() => setSelectedTabIndex(idx)}
                        >
                            {item.title}
                        </button>
                    ))}
                </div>

                <CopyToClipboardButton className="ml-auto mr-4" content={codeBlockItem.content} />
            </div>
            <CodeBlockSkeleton
                theme={theme}
                language={codeBlockItem.language}
                content={codeBlockItem.content}
                fontSize="lg"
            />
        </div>
    );
};
