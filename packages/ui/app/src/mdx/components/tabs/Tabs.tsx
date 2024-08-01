import * as RadixTabs from "@radix-ui/react-tabs";
import { slug } from "github-slugger";
import { useRouter } from "next/router";
import { FC, ReactNode, useEffect } from "react";
import { useTabSelection } from "../../hooks";

export interface TabProps {
    title: string;
    toc?: boolean;
    children: ReactNode;
}

export interface TabGroupProps {
    tabs: TabProps[];
    toc?: boolean;
    groupId?: string;
}

export const TabGroup: FC<TabGroupProps> = ({ tabs, groupId, toc: parentToc = true }) => {
    const router = useRouter();
    const anchor = router.asPath.split("#")[1];
    const { selected, setSelected } = useTabSelection({ groupId });

    useEffect(() => {
        if (anchor != null) {
            const anchorTab = tabs.findIndex((tab) => slug(tab.title) === anchor);

            if (anchorTab >= 0) {
                setSelected(anchorTab.toString());
            }
        }
    }, [anchor, tabs]);

    return (
        <RadixTabs.Root value={selected} onValueChange={setSelected}>
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
