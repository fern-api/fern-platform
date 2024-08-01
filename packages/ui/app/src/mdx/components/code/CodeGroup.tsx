import { CopyToClipboardButton } from "@fern-ui/components";
import { Link1Icon } from "@radix-ui/react-icons";
import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { FERN_GROUPS, FERN_QUERY_PARAMS, useFeatureFlags, useGroup } from "../../../atoms";
import { HorizontalOverflowMask } from "../../../commons/HorizontalOverflowMask";
import { FernSyntaxHighlighter, FernSyntaxHighlighterProps } from "../../../syntax-highlighting/FernSyntaxHighlighter";

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
    const [queryParams] = useAtom(FERN_QUERY_PARAMS);
    const queryGroupId = groupId && groupId in queryParams ? groupId : undefined;
    const queryValue = queryGroupId ? (queryParams[queryGroupId] as string) : undefined;

    const [url, setUrl] = useState("");
    const { isDarkCodeEnabled } = useFeatureFlags();
    const [selectedTabIndex, setSelectedTabIndex] = useState("0");
    const [_, setGroups] = useAtom(FERN_GROUPS);
    const { selectedGroup, group } = useGroup({ key: groupId });

    const containerClass = clsx(
        "after:ring-card-border bg-card relative mt-4 first:mt-0 mb-6 flex w-full min-w-0 max-w-full flex-col rounded-lg shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-['']",
        {
            "dark bg-card-solid": isDarkCodeEnabled,
        },
    );

    const setUniqueSelectedTab = (value: string) => {
        if (groupId) {
            const updatedGroups = { ...group };
            updatedGroups[groupId] = value;

            setGroups({ ...updatedGroups });
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined" && groupId && selectedGroup && selectedGroup[groupId]) {
            const currentUrl = `${window.location.origin}${window.location.pathname}?groupId=${groupId}&value=${selectedGroup[groupId]}`;
            setUrl(currentUrl);
        }
    }, [groupId, selectedGroup]);

    useEffect(() => {
        if (queryGroupId && queryValue && queryGroupId === groupId && items.length > parseInt(queryValue)) {
            setUniqueSelectedTab(queryValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryGroupId, queryValue, groupId]);

    useEffect(() => {
        if (selectedGroup && groupId && selectedGroup[groupId]) {
            setSelectedTabIndex(selectedGroup[groupId] as string);
        }
    }, [selectedGroup, groupId]);

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
        <Tabs.Root
            className={containerClass}
            onValueChange={(value) => {
                setSelectedTabIndex(value);
                setUniqueSelectedTab(value);
            }}
            value={selectedTabIndex}
        >
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
                        {selectedGroup && groupId && (
                            <CopyToClipboardButton icon={Link1Icon} className="ml-1" content={url} />
                        )}
                        <CopyToClipboardButton className="mx-1" content={items[parseInt(selectedTabIndex)]?.code} />
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
