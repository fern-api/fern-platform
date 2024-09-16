import * as RadixAccordion from "@radix-ui/react-accordion";
import { NavArrowRight } from "iconoir-react";
import { useAtom } from "jotai";
import { NextRouter } from "next/router";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { ANCHOR_ATOM } from "../../../atoms";

export interface AccordionItemProps {
    title: string;
    id: string;
    toc?: boolean;
    children: ReactNode;
}

export interface AccordionGroupProps {
    items: AccordionItemProps[];
    router: NextRouter;
    toc?: boolean;
}

export const AccordionGroup: FC<AccordionGroupProps> = ({ items = [] }) => {
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const [anchor, setAnchor] = useAtom(ANCHOR_ATOM);
    useEffect(() => {
        if (anchor != null) {
            if (items.some((tab) => tab.id === anchor)) {
                setActiveTabs((prev) => (prev.includes(anchor) ? prev : [...prev, anchor]));
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
        [setAnchor],
    );

    return (
        <RadixAccordion.Root
            type="multiple"
            className="fern-accordion"
            value={activeTabs}
            onValueChange={handleValueChange}
        >
            {items.map(({ title, id, children }) => (
                <RadixAccordion.Item key={id} value={id} className="fern-accordion-item" id={id}>
                    <RadixAccordion.Trigger className="fern-accordion-trigger">
                        <NavArrowRight className="fern-accordion-trigger-arrow" />
                        <h6 className="fern-accordion-trigger-title">{title}</h6>
                    </RadixAccordion.Trigger>
                    <RadixAccordion.Content className="fern-accordion-content">
                        <div className="m-5">{children}</div>
                    </RadixAccordion.Content>
                </RadixAccordion.Item>
            ))}
        </RadixAccordion.Root>
    );
};
