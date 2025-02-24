import { ReactNode, useEffect, useState } from "react";
import React from "react";

import * as RadixTabs from "@radix-ui/react-tabs";

import { ApiDefinition } from "@fern-api/fdr-sdk";
import { cn } from "@fern-docs/components";

import { useCurrentAnchor } from "@/hooks/use-anchor";
import { useProgrammingLanguage } from "@/state/language";

import { unwrapChildren } from "../../common/unwrap-children";

export interface TabProps {
  title?: string;
  id: string;
  toc?: boolean;
  children: ReactNode;
  language?: string;
}

export interface TabGroupProps {
  toc?: boolean;
}

export function TabGroup({
  children,
}: {
  toc?: boolean;
  children?: ReactNode;
}) {
  const items = unwrapChildren(children, Tab);

  const [activeTab, setActiveTab] = useState(() => items[0]?.props.id);
  const anchor = useCurrentAnchor();
  const [selectedLanguage, setSelectedLanguage] = useProgrammingLanguage();

  useEffect(() => {
    if (anchor != null) {
      if (items.some((item) => item.props.id === anchor)) {
        setActiveTab(anchor);
      }
    }
  }, [anchor, items]);

  useEffect(() => {
    if (selectedLanguage) {
      const matchingTab = items.find(
        (item) =>
          item.props.language &&
          ApiDefinition.cleanLanguage(item.props.language) === selectedLanguage
      );
      if (matchingTab) {
        setActiveTab((prevActiveTab) => {
          const prevTab = items.find((item) => item.props.id === prevActiveTab);
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
  }, [selectedLanguage, items]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const selectedTab = items.find((item) => item.props.id === tabId);
    const cleanedLanguage = selectedTab?.props.language
      ? ApiDefinition.cleanLanguage(selectedTab.props.language)
      : undefined;
    if (cleanedLanguage && cleanedLanguage !== selectedLanguage) {
      setSelectedLanguage(cleanedLanguage);
    }
  };

  return (
    <RadixTabs.Root value={activeTab} onValueChange={handleTabChange}>
      <RadixTabs.List className="border-border-default mb-6 mt-4 flex gap-4 border-b first:-mt-3">
        {items.map(({ props: { title = "Untitled", id = "" } }) => (
          <RadixTabs.Trigger key={id} value={id} asChild>
            <h6
              className={cn(
                "text-body hover:border-border-default -mb-px flex max-w-max cursor-pointer scroll-mt-4 whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6",
                "data-[state=active]:text-(color:--accent-a11) data-[state=active]:before:bg-(color:--accent-track) relative data-[state=active]:before:absolute data-[state=active]:before:inset-x-0 data-[state=active]:before:-bottom-px data-[state=active]:before:h-[2px]"
              )}
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
