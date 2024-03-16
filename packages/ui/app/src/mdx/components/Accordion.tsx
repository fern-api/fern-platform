import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { NextRouter, withRouter } from "next/router";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { getSlugFromText } from "../base-components";

export interface AccordionItemProps {
    title: string;
    children: ReactNode;
}

export interface AccordionPropsWithRouter {
    items: AccordionItemProps[];
    router: NextRouter;
}

const AccordionInternal: FC<AccordionPropsWithRouter> = ({ items = [], router }) => {
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const anchor = router.asPath.split("#")[1];
    useEffect(() => {
        if (anchor != null) {
            const anchorTab = items.findIndex((tab) => getSlugFromText(tab.title) === anchor);
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
                        void router.replace(router.asPath.split("#")[0] + "#" + getSlugFromText(addedItem.title));
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
            className="ring-default divide-default mb-6 mt-4 divide-y rounded-lg ring-1"
            value={activeTabs}
            onValueChange={handleValueChange}
        >
            {items.map((item, idx) => (
                <RadixAccordion.Item
                    key={idx}
                    value={idx.toString()}
                    className="scroll-mt-header-height-padded first:rounded-t-[inherit] last:rounded-b-[inherit]"
                    id={getSlugFromText(item.title)}
                >
                    <RadixAccordion.Trigger className="hover:bg-tag-default group flex w-full items-center gap-3 rounded-[inherit] p-4 transition-colors data-[state=open]:rounded-b-none">
                        <ChevronRightIcon className="t-muted ease-shift duration-400 size-4 transition-transform group-data-[state=open]:rotate-90" />
                        <h6 className="t-default m-0 -mb-px flex max-w-max whitespace-nowrap text-base leading-6">
                            {item.title}
                        </h6>
                    </RadixAccordion.Trigger>
                    <RadixAccordion.Content className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                        <div className="m-5">{item.children}</div>
                    </RadixAccordion.Content>
                </RadixAccordion.Item>
            ))}
        </RadixAccordion.Root>
    );
};

export const Accordion = withRouter(AccordionInternal);
