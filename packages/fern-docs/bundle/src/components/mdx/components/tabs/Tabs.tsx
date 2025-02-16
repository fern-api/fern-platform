import { FC, ReactNode, useEffect, useState } from "react";
import React from "react";

import * as RadixTabs from "@radix-ui/react-tabs";
import { useAtomValue } from "jotai";

import { ApiDefinition } from "@fern-api/fdr-sdk";

import { useProgrammingLanguage } from "@/state/language";

import { ANCHOR_ATOM } from "../../../atoms";

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

export function TabGroup({
  children,
}: {
  toc?: boolean;
  children?: ReactNode;
}) {
  const tabs = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Tab
  ) as React.ReactElement<React.ComponentProps<typeof Tab>>[];

  const [activeTab, setActiveTab] = useState(() => tabs[0]?.props.id);
  const anchor = useAtomValue(ANCHOR_ATOM);
  const [selectedLanguage, setSelectedLanguage] = useProgrammingLanguage();
  useEffect(() => {
    if (anchor != null) {
      if (tabs.some((tab) => tab.props.id === anchor)) {
        setActiveTab(anchor);
      }
    }
  }, [anchor, tabs]);

  useEffect(() => {
    if (selectedLanguage) {
      const matchingTab = tabs.find(
        (tab) =>
          tab.props.language &&
          ApiDefinition.cleanLanguage(tab.props.language) === selectedLanguage
      );
      if (matchingTab) {
        setActiveTab((prevActiveTab) => {
          const prevTab = tabs.find((tab) => tab.props.id === prevActiveTab);
          if (
            prevTab?.props.language &&
            ApiDefinition.cleanLanguage(prevTab.props.language) ===
              selectedLanguage
          ) {
            return prevActiveTab;
          }
          return matchingTab.props.id;
        });
      }
    }
  }, [selectedLanguage, tabs]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const selectedTab = tabs.find((tab) => tab.props.id === tabId);
    const cleanedLanguage = selectedTab?.props.language
      ? ApiDefinition.cleanLanguage(selectedTab.props.language)
      : undefined;
    if (cleanedLanguage && cleanedLanguage !== selectedLanguage) {
      setSelectedLanguage(cleanedLanguage);
    }
  };

  return (
    <RadixTabs.Root value={activeTab} onValueChange={handleTabChange}>
      <RadixTabs.List className="border-default mb-6 mt-4 flex gap-4 border-b first:-mt-3">
        {tabs.map(({ props: { title = "Untitled", id = "" } }) => (
          <RadixTabs.Trigger key={id} value={id} asChild>
            <h6
              className="text-body hover:border-default data-[state=active]:t-accent data-[state=active]:border-accent -mb-px flex max-w-max cursor-pointer scroll-mt-4 whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6"
              id={id}
            >
              {title}
            </h6>
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
}

export function Tab({
  title = "Untitled",
  id = "",
  language,
  children,
}: {
  /**
   * the title of the tab
   * @default "Untitled"
   */
  title?: string;
  /**
   * the id of the tab (this must be unique, and should have been set using the rehypeSlug plugin)
   * @default ""
   */
  id?: string;
  /**
   * whether to show the table of contents (this is used only in the rehype-toc plugin)
   */
  toc?: boolean;
  /**
   * the language of the tab (sets the global language state)
   */
  language?: string;
  /**
   * the children of the tab
   */
  children?: ReactNode;
}) {
  return (
    <RadixTabs.Content
      key={id}
      value={id}
      className="border:content-[''] before:mb-4 before:block"
    >
      {children}
    </RadixTabs.Content>
  );
}
