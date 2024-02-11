import classNames from "classnames";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import type { CodeBlockItem } from "./common/types";

const CodeBlockSkeleton = dynamic(
    () => import("../../commons/CodeBlockSkeleton").then(({ CodeBlockSkeleton }) => CodeBlockSkeleton),
    { ssr: false },
);

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
        <div className="after:ring-border-default relative mb-5 w-full min-w-0 max-w-full after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-inset after:content-['']">
            <div className="bg-tag-default rounded-t-lg">
                <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
                    <div className="flex min-h-10 overflow-x-auto">
                        {items.map((item, idx) => (
                            <button
                                className={classNames("border-b-2 py-2.5 px-4 transition text-xs min-h-10", {
                                    "t-accent border-accent-primary": selectedTabIndex === idx,
                                    "t-muted border-transparent hover:t-accent hover:dark:text-text-default-dark":
                                        selectedTabIndex !== idx,
                                })}
                                key={idx}
                                onClick={() => setSelectedTabIndex(idx)}
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>

                    <CopyToClipboardButton className="ml-2 mr-1" content={codeBlockItem.content} />
                </div>
            </div>
            <CodeBlockSkeleton
                className="bg-tag-default-soft max-h-[350px] overflow-y-auto"
                language={codeBlockItem.language}
                content={codeBlockItem.content}
                highlightLines={codeBlockItem.highlightLines}
                highlightStyle={codeBlockItem.highlightStyle}
                fontSize="lg"
            />
        </div>
    );
};
