import { CopyToClipboardButton } from "@fern-ui/components";
import { Link1Icon } from "@radix-ui/react-icons";
import * as RadixTabs from "@radix-ui/react-tabs";
import { slug } from "github-slugger";
import { useRouter } from "next/router";
import { FC, ReactNode, useEffect, useState } from "react";

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
    const [url, setUrl] = useState("");
    const [activeTab, setActiveTab] = useState("0");
    const router = useRouter();
    const anchor = router.asPath.split("#")[1];

    useEffect(() => {
        if (typeof window !== "undefined") {
            const copyTab = tabs[parseInt(activeTab)];
            if (copyTab) {
                const currentUrl = `${window.location.origin}${window.location.pathname}#${slug(copyTab.title)}`;
                setUrl(currentUrl);
            }
        }
    }, [activeTab, tabs]);

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
            <div className="flex justify-between">
                <RadixTabs.List className="border-default mb-6 mt-4 flex gap-4 border-b first:-mt-3">
                    {tabs.map(({ title, toc = parentToc }, idx) => {
                        const id = slug(title);
                        return (
                            <RadixTabs.Trigger key={idx} value={idx.toString()} asChild>
                                <h6
                                    className="text-default -mb-px flex max-w-max cursor-pointer scroll-mt-content-padded whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6 hover:border-default data-[state=active]:t-accent data-[state=active]:border-accent"
                                    id={id}
                                    data-anchor={toc ? id : undefined}
                                >
                                    {title}
                                </h6>
                            </RadixTabs.Trigger>
                        );
                    })}
                </RadixTabs.List>
                <CopyToClipboardButton icon={Link1Icon} className="ml-1" content={url} />
            </div>
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
