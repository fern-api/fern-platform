import * as RadixTabs from "@radix-ui/react-tabs";
import { useAtomValue } from "jotai";
import { FC, ReactNode, useEffect, useState } from "react";
import { ANCHOR_ATOM } from "../../../atoms";

export interface TabProps {
  title: string;
  id: string;
  toc?: boolean;
  children: ReactNode;
}

export interface TabGroupProps {
  tabs: TabProps[];
  toc?: boolean;
}

export const TabGroup: FC<TabGroupProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(() => tabs[0]?.id);
  const anchor = useAtomValue(ANCHOR_ATOM);
  useEffect(() => {
    if (anchor != null) {
      if (tabs.some((tab) => tab.id === anchor)) {
        setActiveTab(anchor);
      }
    }
  }, [anchor, tabs]);

  return (
    <RadixTabs.Root value={activeTab} onValueChange={setActiveTab}>
      <RadixTabs.List className="border-default mb-6 mt-4 flex gap-4 border-b first:-mt-3">
        {tabs.map(({ title, id }) => (
          <RadixTabs.Trigger key={id} value={id} asChild>
            <h6
              className="text-default -mb-px flex max-w-max cursor-pointer scroll-mt-content-padded whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6 hover:border-default data-[state=active]:t-accent data-[state=active]:border-accent"
              id={id}
            >
              {title}
            </h6>
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((tab) => (
        <RadixTabs.Content
          key={tab.id}
          value={tab.id}
          className="border:content-[''] before:mb-4 before:block"
        >
          {tab.children}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
};
