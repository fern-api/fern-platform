import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fern-docs/components";
import { useAtom } from "jotai";
import { NextRouter } from "next/router";
import { forwardRef, ReactNode, useCallback, useEffect, useState } from "react";
import { ANCHOR_ATOM } from "../../../atoms";

export interface AccordionItemProps {
  title: string;
  id: string;
  toc?: boolean;
  children: ReactNode;
  anchorIds?: string[];
}

export interface AccordionGroupProps {
  items: AccordionItemProps[];
  router: NextRouter;
  toc?: boolean;
}

export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  ({ items = [] }, forwardedRef) => {
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const [anchor, setAnchor] = useAtom(ANCHOR_ATOM);
    useEffect(() => {
      if (anchor != null) {
        const accordionItem = items.find(
          (item) => item.id === anchor || item.anchorIds?.includes(anchor)
        );

        if (accordionItem) {
          setActiveTabs((prev) =>
            prev.includes(accordionItem.id) ? prev : [...prev, accordionItem.id]
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
        ref={forwardedRef}
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
);

AccordionGroup.displayName = "AccordionGroup";
