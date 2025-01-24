import { ApiDefinition } from "@fern-api/fdr-sdk";
import * as RadixTabs from "@radix-ui/react-tabs";
import { useAtom, useAtomValue } from "jotai";
import { FC, ReactNode, useEffect, useState } from "react";
import { getLanguageDisplayName } from "../../../api-reference/examples/code-example";
import { ANCHOR_ATOM, FERN_LANGUAGE_ATOM } from "../../../atoms";

export interface TabProps {
  title?: string;
  id: string;
  toc?: boolean;
  children: ReactNode;
  language?: string;
}

export interface TabGroupProps {
  tabs: TabProps[];
  toc?: boolean;
}

export const TabGroup: FC<TabGroupProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(() => tabs[0]?.id);
  const anchor = useAtomValue(ANCHOR_ATOM);
  const [selectedLanguage, setSelectedLanguage] = useAtom(FERN_LANGUAGE_ATOM);
  useEffect(() => {
    if (anchor != null) {
      if (tabs.some((tab) => tab.id === anchor)) {
        setActiveTab(anchor);
      }
    }
  }, [anchor, tabs]);

  useEffect(() => {
    if (selectedLanguage) {
      const matchingTab = tabs.find(
        (tab) =>
          tab.language &&
          ApiDefinition.cleanLanguage(tab.language) === selectedLanguage
      );
      if (matchingTab) {
        setActiveTab(matchingTab.id);
      }
    }
  }, [selectedLanguage, tabs]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const selectedTab = tabs.find((tab) => tab.id === tabId);
    const cleanedLanguage = selectedTab?.language
      ? ApiDefinition.cleanLanguage(selectedTab.language)
      : undefined;
    if (cleanedLanguage && cleanedLanguage !== selectedLanguage) {
      setSelectedLanguage(cleanedLanguage);
    }
  };

  return (
    <RadixTabs.Root value={activeTab} onValueChange={handleTabChange}>
      <RadixTabs.List className="border-default mb-6 mt-4 flex gap-4 border-b first:-mt-3">
        {tabs.map(({ title, id, language }) => (
          <RadixTabs.Trigger key={id} value={id} asChild>
            <h6
              className="text-default scroll-mt-content-padded hover:border-default data-[state=active]:t-accent data-[state=active]:border-accent -mb-px flex max-w-max cursor-pointer whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6"
              id={id}
            >
              {title ??
                getLanguageDisplayName(
                  ApiDefinition.cleanLanguage(language ?? "Untitled")
                )}
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
