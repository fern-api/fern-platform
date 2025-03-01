import { useEffect, useRef, useState } from "react";
import React from "react";

import * as Tabs from "@radix-ui/react-tabs";

import { cleanLanguage } from "@fern-api/fdr-sdk/api-definition";
import { CopyToClipboardButton, cn } from "@fern-docs/components";
import { FernSyntaxHighlighter } from "@fern-docs/syntax-highlighter";

import { useIsDarkCode } from "@/state/dark-code";
import { useProgrammingLanguage } from "@/state/language";

import { getLanguageDisplayName } from "../../../components/api-reference/examples/code-example";
import { HorizontalOverflowMask } from "../../../components/components/HorizontalOverflowMask";
import { unwrapChildren } from "../../common/unwrap-children";
import { CodeBlock, toSyntaxHighlighterProps } from "./CodeBlock";

export function CodeGroup({ children }: { children: React.ReactNode }) {
  const isDarkCode = useIsDarkCode();

  const items = unwrapChildren(children, CodeBlock);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useProgrammingLanguage();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (selectedLanguage) {
      const matchingTab = itemsRef.current.find((item) => {
        const normalizedLanguage = cleanLanguage(
          item.props.language ?? "plaintext"
        );
        return normalizedLanguage === selectedLanguage;
      });

      if (matchingTab) {
        const newIndex = itemsRef.current.indexOf(matchingTab);
        setSelectedTabIndex((prevIndex) => {
          const prevTab = itemsRef.current[prevIndex];
          if (
            prevTab?.props.language &&
            cleanLanguage(prevTab.props.language) === selectedLanguage
          ) {
            return prevIndex;
          }
          return newIndex;
        });
      }
    }
  }, [selectedLanguage]);

  if (items.length === 0) {
    return null;
  }

  const handleTabChange = (value: string) => {
    const newIndex = parseInt(value, 10);
    setSelectedTabIndex(newIndex);

    const tab = itemsRef.current[newIndex];
    const normalizedLanguage = tab?.props.language
      ? cleanLanguage(tab.props.language)
      : undefined;

    if (normalizedLanguage && normalizedLanguage !== selectedLanguage) {
      setSelectedLanguage(normalizedLanguage);
    }
  };

  const getDisplayNameWithCount = (
    language: string | undefined,
    items: React.ReactElement<React.ComponentProps<typeof CodeBlock>>[],
    currentIndex: number
  ): string => {
    const normalizedLanguage = cleanLanguage(language ?? "");
    const displayName = getLanguageDisplayName(normalizedLanguage);
    const sameLanguageCount = items
      .slice(0, currentIndex)
      .filter(
        (i) => cleanLanguage(i.props.language ?? "") === normalizedLanguage
      ).length;
    return sameLanguageCount > 0
      ? `${displayName} ${sameLanguageCount}`
      : displayName;
  };

  if (items.length === 1 && items[0] != null) {
    return items[0];
  }

  return (
    <Tabs.Root
      className={cn(
        "bg-card-background after:ring-card-border rounded-3 shadow-card-grayscale relative mb-6 mt-4 flex w-full min-w-0 max-w-full flex-col after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-[''] first:mt-0",
        { "bg-card-solid dark": isDarkCode }
      )}
      onValueChange={handleTabChange}
      value={selectedTabIndex.toString()}
    >
      <div className="bg-(color:--grayscale-a2) rounded-t-[inherit]">
        <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0]">
          <Tabs.List className="flex min-h-10" asChild>
            <HorizontalOverflowMask>
              {items.map((item, idx) => {
                const { filename, title = filename, language } = item.props;
                return (
                  <Tabs.Trigger
                    key={idx}
                    value={idx.toString()}
                    className="data-[state=active]:shadow-(color:--accent) group flex min-h-10 items-center px-2 py-1.5 data-[state=active]:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]"
                  >
                    <span className="text-(color:--grayscale-a11) group-data-[state=active]:text-default group-hover:bg-(color:--grayscale-a3) rounded-1 whitespace-nowrap px-2 py-1 text-sm group-data-[state=active]:font-semibold">
                      {title ?? getDisplayNameWithCount(language, items, idx)}
                    </span>
                  </Tabs.Trigger>
                );
              })}
            </HorizontalOverflowMask>
          </Tabs.List>

          <CopyToClipboardButton
            className="ml-2 mr-1"
            content={items[selectedTabIndex]?.props.code ?? ""}
          />
        </div>
      </div>
      {items.map((item, idx) => (
        <Tabs.Content
          value={idx.toString()}
          key={idx}
          className="rounded-b-[inherit] rounded-t-none"
          asChild
        >
          <FernSyntaxHighlighter {...toSyntaxHighlighterProps(item.props)} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
