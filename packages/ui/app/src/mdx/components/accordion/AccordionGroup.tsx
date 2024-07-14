import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { slug } from "github-slugger";
import { NextRouter, useRouter } from "next/router";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";

export interface AccordionItemProps {
    title: string;
    toc?: boolean;
    children: ReactNode;
}

export interface AccordionGroupProps {
    items: AccordionItemProps[];
    router: NextRouter;
    toc?: boolean;
}

export const AccordionGroup: FC<AccordionGroupProps> = ({ items = [], toc: parentToc = true }) => {
    const router = useRouter();
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const anchor = router.asPath.split("#")[1];
    useEffect(() => {
        if (anchor != null) {
            const anchorTab = items.findIndex((tab) => slug(tab.title) === anchor);
            if (anchorTab >= 0) {
                setActiveTabs((prev) => (prev.includes(anchorTab.toString()) ? prev : [...prev, anchorTab.toString()]));
            }
        }
    }, [anchor, items]);

    const handleValueChange = useCallback(
        (nextActiveTabs: string[]) => {
            setActiveTabs((prev) => {
                const added = nextActiveTabs.filter((tab) => !prev.includes(tab));
                if (added[0] != null) {
                    const addedItem = items[parseInt(added[0])];
                    if (addedItem != null) {
                        void router.replace(router.asPath.split("#")[0] + "#" + slug(addedItem.title));
                    }
                }
                return nextActiveTabs;
            });
        },
        [items, router],
    );

    return (
        <RadixAccordion.Root
            type="multiple"
            className="fern-accordion"
            value={activeTabs}
            onValueChange={handleValueChange}
        >
            {items.map(({ title, toc = parentToc, children }, idx) => {
                const id = slug(title);
                return (
                    <RadixAccordion.Item key={idx} value={idx.toString()} className="fern-accordion-item" id={id}>
                        <RadixAccordion.Trigger className="fern-accordion-trigger">
                            <ChevronRightIcon className="fern-accordion-trigger-arrow" />
                            <h6 className="fern-accordion-trigger-title" data-anchor={toc ? id : undefined}>
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
