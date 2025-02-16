import React from "react";

import { useAtom } from "jotai";

import * as AccordionComponent from "@fern-docs/components";

import { ANCHOR_ATOM } from "@/components/atoms";

export interface AccordionGroupProps {
  children: React.ReactNode;
  toc?: boolean;
}

export function AccordionGroup({ children }: AccordionGroupProps) {
  const [activeTabs, setActiveTabs] = React.useState<string[]>([]);
  const [anchor, setAnchor] = useAtom(ANCHOR_ATOM);

  const items = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Accordion
  ) as React.ReactElement<React.ComponentProps<typeof Accordion>>[];

  React.useEffect(() => {
    if (anchor != null) {
      if (items.some((tab) => tab.props.id === anchor)) {
        setActiveTabs((prev) =>
          prev.includes(anchor) ? prev : [...prev, anchor]
        );
      }
    }
  }, [anchor, items]);

  const handleValueChange = React.useCallback(
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
    <AccordionComponent.Accordion
      type="multiple"
      value={activeTabs}
      onValueChange={handleValueChange}
      className="m-mdx"
    >
      {children}
    </AccordionComponent.Accordion>
  );
}

export function Accordion({
  title = "Untitled",
  id = "",
  children,
}: {
  /**
   * the title of the accordion
   * @default "Untitled"
   */
  title?: string;
  /**
   * he id of the accordion. this must be unique, and should have been set using the rehypeSlug plugin
   * @default ""
   */
  id?: string;
  /**
   * whether to show the table of contents (this is used only in the rehype-toc plugin)
   */
  toc?: boolean;
  /**
   * the children of the accordion
   */
  children?: React.ReactNode;
}) {
  if (!children) {
    return null;
  }
  return (
    <AccordionComponent.AccordionItem
      id={id}
      value={id}
      className="scroll-mt-4"
    >
      <AccordionComponent.AccordionTrigger>
        {title}
      </AccordionComponent.AccordionTrigger>
      <AccordionComponent.AccordionContent>
        <div className="m-5">{children}</div>
      </AccordionComponent.AccordionContent>
    </AccordionComponent.AccordionItem>
  );
}
