import * as RadixTabs from "@radix-ui/react-tabs";
import { FC, ReactNode } from "react";

export interface FernTabProps {
    title: string;
    content: ReactNode;
}

export interface FernTabsProps extends RadixTabs.TabsProps {
    tabs: FernTabProps[];
}

export const FernTabs: FC<FernTabsProps> = ({ tabs, ...props }) => {
    return (
        <RadixTabs.Root {...props}>
            <RadixTabs.List className="border-default mb-6 mt-0 flex gap-4 border-b">
                {tabs.map(({ title }, idx) => (
                    <RadixTabs.Trigger key={idx} value={idx.toString()} asChild>
                        <h6 className="text-default scroll-mt-content-padded hover:border-default data-[state=active]:t-accent data-[state=active]:border-accent -mb-px flex max-w-max cursor-default whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6">
                            {title}
                        </h6>
                    </RadixTabs.Trigger>
                ))}
            </RadixTabs.List>
            {tabs.map((tab, idx) => (
                <RadixTabs.Content
                    key={idx}
                    value={idx.toString()}
                    className="border:content-[''] before:mb-2 before:block"
                >
                    {tab.content}
                </RadixTabs.Content>
            ))}
        </RadixTabs.Root>
    );
};
