import * as RadixTabs from "@radix-ui/react-tabs";
import { slug } from "github-slugger";
import { useAtomValue } from "jotai";
import { FC, ReactNode, useEffect, useState } from "react";
import { ANCHOR_ATOM } from "../../../atoms";

export interface TabProps {
    title: string;
    toc?: boolean;
    children: ReactNode;
}

export interface TabGroupProps {
    tabs: TabProps[];
    toc?: boolean;
}

export const TabGroup: FC<TabGroupProps> = ({ tabs, toc: parentToc = true }) => {
    const [activeTab, setActiveTab] = useState("0");
    const anchor = useAtomValue(ANCHOR_ATOM);
    useEffect(() => {
        if (anchor != null) {
            const anchorTab = tabs.findIndex((tab) => slug(tab.title) === anchor);
            if (anchorTab >= 0) {
                setActiveTab(anchorTab.toString());
            }
        }
    }, [anchor, tabs]);

    return (
        <RadixTabs.Root value={activeTab} onValueChange={setActiveTab}>
            <RadixTabs.List className="border-default mb-6 mt-4 flex gap-4 border-b first:-mt-3">
                {tabs.map(({ title, toc = parentToc }, idx) => {
                    const id = slug(title);
                    return (
                        <RadixTabs.Trigger key={idx} value={idx.toString()} asChild>
                            <h6
                                className="text-default -mb-px flex max-w-max cursor-pointer scroll-mt-content-padded whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6 hover:border-default data-[state=active]:t-accent data-[state=active]:border-accent"
                                id={toc ? id : undefined}
                            >
                                {title}
                            </h6>
                        </RadixTabs.Trigger>
                    );
                })}
            </RadixTabs.List>
            {tabs.map((tab, idx) => (
                <RadixTabs.Content
                    key={idx}
                    value={idx.toString()}
                    className="border:content-[''] before:mb-4 before:block"
                >
                    {tab.children}
                </RadixTabs.Content>
            ))}
        </RadixTabs.Root>
    );
};
