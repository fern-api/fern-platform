import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { FC, ReactNode } from "react";

export interface AccordionItemProps {
    title: string;
    children: ReactNode;
}

export interface AccordionProps {
    items: AccordionItemProps[];
}

export const Accordion: FC<AccordionProps> = ({ items = [] }) => {
    return (
        <RadixAccordion.Root
            type="multiple"
            className="ring-default divide-default mb-5 mt-3 divide-y rounded-lg ring-1"
        >
            {items.map((item, idx) => (
                <RadixAccordion.Item
                    key={idx}
                    value={idx.toString()}
                    className="overflow-hidden first:rounded-t-[inherit] last:rounded-b-[inherit]"
                >
                    <RadixAccordion.Trigger className="hover:bg-tag-default group flex w-full items-center gap-3 rounded-[inherit] p-4 hover:transition-all data-[state=open]:rounded-b-none">
                        <ChevronRightIcon className="t-muted ease-shift duration-400 size-4 transition-transform group-data-[state=open]:rotate-90" />
                        <span className="t-default m-0 -mb-px flex max-w-max whitespace-nowrap text-base leading-6">
                            {item.title}
                        </span>
                    </RadixAccordion.Trigger>
                    <RadixAccordion.Content className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                        <div className="m-5">{item.children}</div>
                    </RadixAccordion.Content>
                </RadixAccordion.Item>
            ))}
        </RadixAccordion.Root>
    );
};
