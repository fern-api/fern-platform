import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { CopyToClipboardButton } from "../../syntax-highlighting/CopyToClipboardButton";
import {
    FernSyntaxHighlighterTokens,
    FernSyntaxHighlighterTokensProps,
} from "../../syntax-highlighting/FernSyntaxHighlighterTokens";

export declare namespace CodeBlocks {
    export interface Item extends FernSyntaxHighlighterTokensProps {
        title?: string;
    }

    export interface Props {
        items: Item[];
    }
}

export const CodeBlocks: React.FC<React.PropsWithChildren<CodeBlocks.Props>> = ({ items }) => {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const codeBlockItem = items[selectedTabIndex];
    if (codeBlockItem == null) {
        return null;
    }
    return (
        <Tabs.Root
            className="after:ring-border-default dark:bg-tag-default-soft relative mb-5 flex max-h-[400px] w-full min-w-0 max-w-full flex-col rounded-lg bg-white/70 shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-['']"
            onValueChange={(value) => setSelectedTabIndex(parseInt(value, 10))}
            defaultValue="0"
        >
            <div className="bg-tag-default-soft rounded-t-lg">
                <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
                    <Tabs.List className="flex min-h-10 overflow-x-auto">
                        {items.map((item, idx) => (
                            <Tabs.Trigger
                                key={idx}
                                value={idx.toString()}
                                className="data-[state=active]:shadow-accent-primary-light dark:data-[state=active]:shadow-accent-primary-dark group flex min-h-10 items-center px-2 py-1.5 data-[state=active]:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]"
                            >
                                <span className="t-muted group-data-[state=active]:t-default group-hover:bg-tag-default rounded px-2 py-1 text-sm group-data-[state=active]:font-semibold">
                                    {item.title ?? `Untitled ${idx + 1}`}
                                </span>
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>

                    <CopyToClipboardButton className="ml-2 mr-1" content={codeBlockItem.tokens.code} />
                </div>
            </div>
            {items.map((item, idx) => (
                <Tabs.Content value={idx.toString()} key={idx} className="rounded-t-0 rounded-b-[inherit]" asChild>
                    <FernSyntaxHighlighterTokens {...item} />
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};
