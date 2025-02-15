import { FC, ReactNode } from "react";

import * as RadixTabs from "@radix-ui/react-tabs";

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
      <RadixTabs.List className="border-default mt-0 mb-6 flex gap-4 border-b">
        {tabs.map(({ title }, idx) => (
          <RadixTabs.Trigger key={idx} value={idx.toString()} asChild>
            <h6 className="text-body hover:border-default data-[state=active]:text-accent data-[state=active]:border-accent -mb-px flex max-w-max cursor-default scroll-mt-4 border-b border-transparent pt-3 pb-2.5 text-sm leading-6 font-semibold whitespace-nowrap">
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
