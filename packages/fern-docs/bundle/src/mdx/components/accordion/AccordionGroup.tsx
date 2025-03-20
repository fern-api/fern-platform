import React from "react";

import * as AccordionComponent from "@fern-docs/components";

import { useCurrentAnchor } from "@/hooks/use-anchor";

import { unwrapChildren } from "../../common/unwrap-children";

export interface AccordionGroupProps {
  children: React.ReactNode;
  toc?: boolean;
}

export function AccordionGroup({ children }: AccordionGroupProps) {
  const [activeTabs, setActiveTabs] = React.useState<string[]>([]);
  const anchor = useCurrentAnchor();

  const items = unwrapChildren(children, Accordion);

  const findParentAccordion = React.useCallback(
    (anchor: string) => {
      if (items.some((tab) => tab.props.id === anchor)) {
        return anchor;
      }

      const parentAccordion = items.find((tab) =>
        tab.props.nestedHeaders?.includes(anchor)
      );

      if (parentAccordion) {
        return parentAccordion.props.id;
      }

      return undefined;
    },
    [items]
  );

  React.useEffect(() => {
    if (anchor != null) {
      const parentAccordion = findParentAccordion(anchor);
      if (parentAccordion) {
        setActiveTabs((prev) =>
          prev.includes(parentAccordion) ? prev : [...prev, parentAccordion]
        );

        // wait for the accordion to open before scrolling
        setTimeout(() => {
          const element = document.getElementById(anchor);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor]);

  const handleValueChange = React.useCallback((nextActiveTabs: string[]) => {
    setActiveTabs((prev) => {
      const added = nextActiveTabs.filter((tab) => !prev.includes(tab));
      if (added[0] != null) {
        window.location.hash = `#${added[0]}`;
      }

      const removed = prev.filter((tab) => !nextActiveTabs.includes(tab));
      if (removed[0] != null) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      return nextActiveTabs;
    });
  }, []);

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
  nestedHeaders,
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
  /**
   * the headers nested within the accordion
   */
  nestedHeaders?: string[];
}) {
  if (!children) {
    return null;
  }
  return (
    <AccordionComponent.AccordionItem
      id={id}
      value={id}
      nestedHeaders={nestedHeaders}
    >
      <AccordionComponent.AccordionTrigger>
        {title}
      </AccordionComponent.AccordionTrigger>
      <AccordionComponent.AccordionContent>
        <div className="px-5">{children}</div>
      </AccordionComponent.AccordionContent>
    </AccordionComponent.AccordionItem>
  );
}
