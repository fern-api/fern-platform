import * as Tabs from "@radix-ui/react-tabs";
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
        <Tabs.Root
            className="after:ring-border-default relative mb-5 w-full min-w-0 max-w-full after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-inset after:content-['']"
            onValueChange={(value) => setSelectedTabIndex(parseInt(value, 10))}
            defaultValue="0"
        >
            <div className="bg-tag-default rounded-t-lg">
                <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
                    <Tabs.List className="flex min-h-10 overflow-x-auto">
                        {items.map((item, idx) => (
                            <Tabs.Trigger
                                key={idx}
                                value={idx.toString()}
                                className="data-[state=active]:shadow-accent group min-h-10 px-2 py-1.5 data-[state=active]:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]"
                            >
                                <span className="t-muted group-data-[state=active]:t-default group-hover:bg-tag-default rounded px-2 py-1 text-sm group-data-[state=active]:font-semibold">
                                    {item.title}
                                </span>
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>

                    <CopyToClipboardButton className="ml-2 mr-1" content={codeBlockItem.content} />
                </div>
            </div>
            {items.map((item, idx) => (
                <Tabs.Content value={idx.toString()} key={idx}>
                    <CodeBlockSkeleton
                        className="bg-tag-default-soft max-h-[350px] overflow-y-auto"
                        language={item.language}
                        content={item.content}
                        highlightLines={item.highlightLines}
                        highlightStyle={item.highlightStyle}
                        fontSize="lg"
                    />
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};
