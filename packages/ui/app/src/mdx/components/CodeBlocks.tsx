import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { HorizontalOverflowMask } from "../../commons/HorizontalOverflowMask";
import { CopyToClipboardButton } from "../../syntax-highlighting/CopyToClipboardButton";
import { FernSyntaxHighlighter, FernSyntaxHighlighterProps } from "../../syntax-highlighting/FernSyntaxHighlighter";

export declare namespace CodeBlocks {
    export interface Item extends FernSyntaxHighlighterProps {
        title?: string;
    }

    export interface Props {
        items: Item[];
    }
}

export const CodeBlocks: React.FC<React.PropsWithChildren<CodeBlocks.Props>> = ({ items }) => {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    const containerClass =
        "after:ring-default bg-card relative mb-5 flex max-h-[400px] w-full min-w-0 max-w-full flex-col rounded-lg shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-['']";

    if (items.length === 1 && items[0] != null) {
        return (
            <div className={containerClass}>
                <div className="bg-tag-default-soft rounded-t-[inherit]">
                    <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0]">
                        <div className="flex min-h-10 overflow-x-auto">
                            <div className="flex items-center px-3 py-1.5">
                                <span className="t-muted rounded text-sm font-semibold">
                                    {items[0].title ?? "Untitled"}
                                </span>
                            </div>
                        </div>
                        <CopyToClipboardButton className="ml-2 mr-1" content={items[0].code} />
                    </div>
                </div>
                <FernSyntaxHighlighter {...items[0]} className="rounded-b-[inherit]" />
            </div>
        );
    }

    return (
        <Tabs.Root
            className={containerClass}
            onValueChange={(value) => setSelectedTabIndex(parseInt(value, 10))}
            defaultValue="0"
        >
            <div className="bg-tag-default-soft rounded-t-[inherit]">
                <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0]">
                    <Tabs.List className="flex min-h-10" asChild>
                        <HorizontalOverflowMask>
                            {items.map((item, idx) => (
                                <Tabs.Trigger
                                    key={idx}
                                    value={idx.toString()}
                                    className="data-[state=active]:shadow-accent-primary  group flex min-h-10 items-center px-2 py-1.5 data-[state=active]:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]"
                                >
                                    <span className="t-muted group-data-[state=active]:t-default group-hover:bg-tag-default whitespace-nowrap rounded px-2 py-1 text-sm group-data-[state=active]:font-semibold">
                                        {item.title ?? `Untitled ${idx + 1}`}
                                    </span>
                                </Tabs.Trigger>
                            ))}
                        </HorizontalOverflowMask>
                    </Tabs.List>

                    <CopyToClipboardButton className="ml-2 mr-1" content={items[selectedTabIndex]?.code} />
                </div>
            </div>
            {items.map((item, idx) => (
                <Tabs.Content value={idx.toString()} key={idx} className="rounded-t-0 rounded-b-[inherit]" asChild>
                    <FernSyntaxHighlighter {...item} />
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};
