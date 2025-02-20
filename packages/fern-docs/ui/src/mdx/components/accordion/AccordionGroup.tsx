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
  nestedHeaders?: string[];
  children: ReactNode;
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

    const findParentAccordion = useCallback(
      (anchor: string) => {
        // Direct match
        if (items.some((tab) => tab.id === anchor)) {
          return anchor;
        }

        const parentAccordion = items.find((tab) =>
          tab.nestedHeaders?.includes(anchor)
        );

        if (parentAccordion) {
          return parentAccordion.id;
        }

        return undefined;
      },
      [items]
    );

    useEffect(() => {
      if (anchor != null) {
        const parentAccordion = findParentAccordion(anchor);
        if (parentAccordion) {
          setActiveTabs((prev) =>
            prev.includes(parentAccordion) ? prev : [...prev, parentAccordion]
          );
        }
      }
    }, [anchor, findParentAccordion]);

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
