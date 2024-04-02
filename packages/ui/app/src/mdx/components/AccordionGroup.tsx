import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { NextRouter, useRouter } from "next/router";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { getSlugFromText } from "../../util/getSlugFromText";

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
            className="fern-card divide-default mb-6 mt-4 divide-y rounded-lg"
            value={activeTabs}
            onValueChange={handleValueChange}
        >
            {items.map(({ title, toc = parentToc, children }, idx) => {
                const slug = getSlugFromText(title);
                return (
                    <RadixAccordion.Item
                        key={idx}
                        value={idx.toString()}
                        className="scroll-mt-header-height-padded first:rounded-t-[inherit] last:rounded-b-[inherit]"
                        id={slug}
                    >
                        <RadixAccordion.Trigger className="hover:bg-tag-default group flex w-full items-center gap-3 rounded-[inherit] p-4 transition-colors data-[state=open]:rounded-b-none">
                            <ChevronRightIcon className="t-muted ease-shift duration-400 size-4 transition-transform group-data-[state=open]:rotate-90" />
                            <h6
                                className="t-default m-0 -mb-px flex max-w-max whitespace-nowrap text-base leading-6"
                                data-anchor={toc ? slug : undefined}
                            >
                                {title}
                            </h6>
                        </RadixAccordion.Trigger>
                        <RadixAccordion.Content className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                            <div className="m-5">{children}</div>
                        </RadixAccordion.Content>
                    </RadixAccordion.Item>
                );
            })}
        </RadixAccordion.Root>
    );
};
