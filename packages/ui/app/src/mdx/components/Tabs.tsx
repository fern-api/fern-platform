import * as RadixTabs from "@radix-ui/react-tabs";
import { useRouter } from "next/router";
import { FC, ReactNode, useEffect, useState } from "react";
import { getSlugFromText } from "../../util/getSlugFromText";

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
    const router = useRouter();
    const anchor = router.asPath.split("#")[1];
    useEffect(() => {
        if (anchor != null) {
            const anchorTab = tabs.findIndex((tab) => getSlugFromText(tab.title) === anchor);
            if (anchorTab >= 0) {
                setActiveTab(anchorTab.toString());
            }
        }
    }, [anchor, tabs]);

    return (
        <RadixTabs.Root value={activeTab} onValueChange={setActiveTab}>
            <RadixTabs.List className="border-default mb-6 mt-4 flex gap-4 border-b">
                {tabs.map(({ title, toc = parentToc }, idx) => {
                    const slug = getSlugFromText(title);
                    return (
                        <RadixTabs.Trigger key={idx} value={idx.toString()} asChild>
                            <h6
                                className="text-default data-[state=active]:border-accent-primary data-[state=active]:t-accent hover:border-default scroll-mt-header-height-padded -mb-px flex max-w-max cursor-default whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6"
                                id={slug}
                                data-anchor={toc ? slug : undefined}
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
