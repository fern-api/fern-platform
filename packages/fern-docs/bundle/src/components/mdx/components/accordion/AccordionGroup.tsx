import { ReactNode, useCallback, useEffect, useState } from "react";

import { useAtom } from "jotai";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fern-docs/components";

import { ANCHOR_ATOM } from "../../../atoms";

export interface AccordionItemProps {
  title: string;
  id: string;
  toc?: boolean;
  children: ReactNode;
}

export interface AccordionGroupProps {
  items: AccordionItemProps[];
  toc?: boolean;
}

export function AccordionGroup({ items = [] }: AccordionGroupProps) {
  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  const [anchor, setAnchor] = useAtom(ANCHOR_ATOM);
  useEffect(() => {
    if (anchor != null) {
      if (items.some((tab) => tab.id === anchor)) {
        setActiveTabs((prev) =>
          prev.includes(anchor) ? prev : [...prev, anchor]
        );
      }
    }
  }, [anchor, items]);

  const handleValueChange = useCallback(
    (nextActiveTabs: string[]) => {
      setActiveTabs((prev) => {
        const added = nextActiveTabs.filter((tab) => !prev.includes(tab));
        if (added[0] != null) {
          setAnchor(added[0]);
        }
        return nextActiveTabs;
      });
    },
    [setAnchor]
  );

  return (
    <Accordion
      type="multiple"
      value={activeTabs}
      onValueChange={handleValueChange}
      className="m-mdx"
    >
      {items.map(({ title, id, children }) => (
        <AccordionItem
          key={id}
          value={id}
          id={id}
          className="scroll-mt-content-padded"
        >
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>
            <div className="m-5">{children}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
