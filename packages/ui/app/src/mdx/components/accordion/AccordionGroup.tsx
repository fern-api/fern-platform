import * as RadixAccordion from "@radix-ui/react-accordion";
import { slug } from "github-slugger";
import { NavArrowRight } from "iconoir-react";
import { useAtom } from "jotai";
import { NextRouter } from "next/router";
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ANCHOR_ATOM } from "../../../atoms";
import { useUpdateAccordionFrequencyMap } from "../../../atoms/accordion";

export interface AccordionItemProps {
    title: string;
    toc?: boolean;
    children: ReactNode;
}

export interface AccordionGroupProps {
    items: AccordionItemProps[];
    router: NextRouter;
    toc?: boolean;
    key: string;
}

export const AccordionGroup: FC<AccordionGroupProps> = ({ items = [], toc: parentToc = true }) => {
    const firstRun = useRef(true);
    const [tabSlugs, setTabSlugs] = useState<string[]>([]);
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const [anchor, setAnchor] = useAtom(ANCHOR_ATOM);

    const updateAccordionFrequencyMap = useUpdateAccordionFrequencyMap();

    useEffect(() => {
        if (firstRun.current) {
            const newTabSlugs: string[] = [];
            items.forEach(({ title }) => {
                const count = updateAccordionFrequencyMap(title);
                newTabSlugs.push(slug(count > 1 ? `${title}-${count}` : title));
            });
            setTabSlugs(newTabSlugs);
        }
        firstRun.current = false;
    }, [firstRun, items, updateAccordionFrequencyMap]);

    useEffect(() => {
        if (anchor != null) {
            const anchorTab = items.findIndex((_, idx) => tabSlugs[idx] === anchor);
            if (anchorTab >= 0) {
                setActiveTabs((prev) => (prev.includes(anchorTab.toString()) ? prev : [...prev, anchorTab.toString()]));
            }
        }
    }, [anchor, items, tabSlugs]);

    const handleValueChange = useCallback(
        (nextActiveTabs: string[]) => {
            setActiveTabs((prev) => {
                const added = nextActiveTabs.filter((tab) => !prev.includes(tab));
                if (added[0] != null) {
                    const addedItem = items[parseInt(added[0])];
                    if (addedItem != null) {
                        setAnchor(tabSlugs[parseInt(added[0])]);
                    }
                }
                return nextActiveTabs;
            });
        },
        [items, setAnchor, tabSlugs],
    );

    return (
        <RadixAccordion.Root
            type="multiple"
            className="fern-accordion"
            value={activeTabs}
            onValueChange={handleValueChange}
        >
            {items.map(({ title, toc = parentToc, children }, idx) => {
                const id = tabSlugs[idx];
                return (
                    <RadixAccordion.Item key={idx} value={idx.toString()} className="fern-accordion-item" id={id}>
                        <RadixAccordion.Trigger className="fern-accordion-trigger">
                            <NavArrowRight className="fern-accordion-trigger-arrow" />
                            <h6 className="fern-accordion-trigger-title" id={toc ? id : undefined}>
                                {title}
                            </h6>
                        </RadixAccordion.Trigger>
                        <RadixAccordion.Content className="fern-accordion-content">
                            <div className="m-5">{children}</div>
                        </RadixAccordion.Content>
                    </RadixAccordion.Item>
                );
            })}
        </RadixAccordion.Root>
    );
};
