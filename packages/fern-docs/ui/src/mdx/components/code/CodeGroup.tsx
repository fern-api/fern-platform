import { ApiDefinition } from "@fern-api/fdr-sdk";
import { CopyToClipboardButton } from "@fern-docs/components";
import {
  FernSyntaxHighlighter,
  type FernSyntaxHighlighterProps,
} from "@fern-docs/syntax-highlighter";
import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { getLanguageDisplayName } from "../../../api-reference/examples/code-example";
import { FERN_LANGUAGE_ATOM, useEdgeFlags } from "../../../atoms";
import { HorizontalOverflowMask } from "../../../components/HorizontalOverflowMask";

export declare namespace CodeGroup {
  export interface Item extends FernSyntaxHighlighterProps {
    title?: string;
    matchLanguage?: string;
  }

  export interface Props {
    items: Item[];
  }
}

export const CodeGroup: React.FC<React.PropsWithChildren<CodeGroup.Props>> = ({
  items,
}) => {
  const { isDarkCodeEnabled } = useEdgeFlags();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useAtom(FERN_LANGUAGE_ATOM);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (selectedLanguage) {
      const matchingTab = itemsRef.current.find((item) => {
        if (item.matchLanguage) {
          return (
            ApiDefinition.cleanLanguage(item.matchLanguage) === selectedLanguage
          );
        }
        return (
          item.language &&
          ApiDefinition.cleanLanguage(item.language) === selectedLanguage
        );
      });

      if (matchingTab) {
        const newIndex = itemsRef.current.indexOf(matchingTab);
        setSelectedTabIndex((prevIndex) => {
          const prevTab = itemsRef.current[prevIndex];
          if (prevTab) {
            const currentMatch = prevTab.matchLanguage
              ? ApiDefinition.cleanLanguage(prevTab.matchLanguage) ===
                selectedLanguage
              : prevTab.language &&
                ApiDefinition.cleanLanguage(prevTab.language) ===
                  selectedLanguage;
            if (currentMatch) {
              return prevIndex;
            }
          }
          return newIndex;
        });
      }
    }
  }, [selectedLanguage]);

  const handleTabChange = (value: string) => {
    const newIndex = parseInt(value, 10);
    setSelectedTabIndex(newIndex);

    const tab = itemsRef.current[newIndex];
    const normalizedLanguage = tab?.matchLanguage
      ? ApiDefinition.cleanLanguage(tab.matchLanguage)
      : tab?.language
        ? ApiDefinition.cleanLanguage(tab.language)
        : undefined;

    if (normalizedLanguage && normalizedLanguage !== selectedLanguage) {
      setSelectedLanguage(normalizedLanguage);
    }
  };

  const getDisplayNameWithCount = (
    language: string | undefined,
    items: CodeGroup.Item[],
    currentIndex: number
  ): string => {
    const normalizedLanguage = ApiDefinition.cleanLanguage(language ?? "");
    const displayName = getLanguageDisplayName(normalizedLanguage);
    const sameLanguageCount = items
      .slice(0, currentIndex)
      .filter(
        (i) =>
          ApiDefinition.cleanLanguage(i.language ?? "") === normalizedLanguage
      ).length;
    return sameLanguageCount > 0
      ? `${displayName} ${sameLanguageCount}`
      : displayName;
  };

  const containerClass = clsx(
    "bg-card after:ring-card-border relative mb-6 mt-4 flex w-full min-w-0 max-w-full flex-col rounded-lg shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-[''] first:mt-0",
    {
      "bg-card-solid dark": isDarkCodeEnabled,
    }
  );

  if (items.length === 1 && items[0] != null) {
    return (
      <div className={containerClass}>
        <div className="bg-tag-default-soft rounded-t-[inherit]">
          <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0]">
            <div className="flex min-h-10 overflow-x-auto">
              <div className="flex items-center px-3 py-1.5">
                <span className="t-muted rounded text-sm font-semibold">
                  {items[0].title ??
                    ApiDefinition.cleanLanguage(items[0].language)}
                </span>
              </div>
            </div>
            <CopyToClipboardButton
              className="ml-2 mr-1"
              content={items[0].code}
            />
          </div>
        </div>
        <FernSyntaxHighlighter {...items[0]} className="rounded-b-[inherit]" />
      </div>
    );
  }

  return (
    <Tabs.Root
      className={containerClass}
      onValueChange={handleTabChange}
      value={selectedTabIndex.toString()}
    >
      <div className="bg-tag-default-soft rounded-t-[inherit]">
        <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0]">
          <Tabs.List className="flex min-h-10" asChild>
            <HorizontalOverflowMask>
              {items.map((item, idx) => (
                <Tabs.Trigger
                  key={idx}
                  value={idx.toString()}
                  className="data-[state=active]:shadow-accent group flex min-h-10 items-center px-2 py-1.5 data-[state=active]:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]"
                >
                  <span className="t-muted group-data-[state=active]:t-default group-hover:bg-tag-default whitespace-nowrap rounded px-2 py-1 text-sm group-data-[state=active]:font-semibold">
                    {item.title ??
                      getDisplayNameWithCount(item.language, items, idx)}
                  </span>
                </Tabs.Trigger>
              ))}
            </HorizontalOverflowMask>
          </Tabs.List>

          <CopyToClipboardButton
            className="ml-2 mr-1"
            content={items[selectedTabIndex]?.code}
          />
        </div>
      </div>
      {items.map((item, idx) => (
        <Tabs.Content
          value={idx.toString()}
          key={idx}
          className="rounded-t-0 rounded-b-[inherit]"
          asChild
        >
          <FernSyntaxHighlighter {...item} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
