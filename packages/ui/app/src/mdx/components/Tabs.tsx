import * as RadixTabs from "@radix-ui/react-tabs";
import { FC, ReactNode } from "react";

export interface TabProps {
    title: string;
    children: ReactNode;
}

export interface TabsProps {
    tabs: TabProps[];
}

export const Tabs: FC<TabsProps> = ({ tabs }) => {
    return (
        <RadixTabs.Root defaultValue={"0"}>
            <RadixTabs.List className="border-default mb-6 mt-5 flex gap-4 border-b">
                {tabs.map((tab, idx) => (
                    <RadixTabs.Trigger key={idx} value={idx.toString()} asChild>
                        <h2 className="text-default data-[state=active]:border-accent-primary data-[state=active]:t-accent hover:border-default -mb-px flex max-w-max cursor-default whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6">
                            {tab.title}
                        </h2>
                    </RadixTabs.Trigger>
                ))}
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
