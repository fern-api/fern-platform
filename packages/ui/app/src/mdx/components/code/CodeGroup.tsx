import { CopyToClipboardButton } from "@fern-ui/components";
import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import { useFeatureFlags } from "../../../atoms";
import { HorizontalOverflowMask } from "../../../commons/HorizontalOverflowMask";
import { FernSyntaxHighlighter, FernSyntaxHighlighterProps } from "../../../syntax-highlighting/FernSyntaxHighlighter";
import { useTabSelection } from "../../hooks";

export declare namespace CodeGroup {
    export interface Item extends FernSyntaxHighlighterProps {
        title?: string;
    }

    export interface Props {
        items: Item[];
        groupId?: string;
    }
}

export const CodeGroup: React.FC<React.PropsWithChildren<CodeGroup.Props>> = ({ items, groupId }) => {
    const { isDarkCodeEnabled } = useFeatureFlags();
    const { selected, setSelected } = useTabSelection({ groupId });

    const containerClass = clsx(
        "after:ring-card-border bg-card relative mt-4 first:mt-0 mb-6 flex w-full min-w-0 max-w-full flex-col rounded-lg shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-['']",
        {
            "dark bg-card-solid": isDarkCodeEnabled,
        },
    );

    if (items.length === 1 && items[0] != null) {
        return (
            <div className={containerClass}>
                <div className="rounded-t-[inherit] bg-tag-default-soft">
                    <div className="mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0] shadow-border-default">
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
        <Tabs.Root className={containerClass} onValueChange={setSelected} value={selected}>
            <div className="rounded-t-[inherit] bg-tag-default-soft">
                <div className="mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0] shadow-border-default">
                    <Tabs.List className="flex min-h-10" asChild>
                        <HorizontalOverflowMask>
                            {items.map((item, idx) => (
                                <Tabs.Trigger
                                    key={idx}
                                    value={idx.toString()}
                                    className="group  flex min-h-10 items-center px-2 py-1.5 data-[state=active]:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)] data-[state=active]:shadow-accent"
                                >
                                    <span className="t-muted whitespace-nowrap rounded px-2 py-1 text-sm group-data-[state=active]:t-default group-hover:bg-tag-default group-data-[state=active]:font-semibold">
                                        {item.title ?? `Untitled ${idx + 1}`}
                                    </span>
                                </Tabs.Trigger>
                            ))}
                        </HorizontalOverflowMask>
                    </Tabs.List>

                    <div>
                        <CopyToClipboardButton className="mx-1" content={items[parseInt(selected)]?.code} />
                    </div>
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
