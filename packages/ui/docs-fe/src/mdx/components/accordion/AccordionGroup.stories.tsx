import type { Meta, StoryObj } from "@storybook/react";
import { AccordionGroup } from "./AccordionGroup";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof AccordionGroup> = {
    title: "General/AccordionGroup",
    component: AccordionGroup,
    tags: ["autodocs"],
    args: {
        items: [
            {
                id: "accordion-item-1",
                title: "Accordion Item 1. This is a long title to test the wrapping of the title.",
                children:
                    "Accordion Item 1 Content. Irure sunt enim proident est excepteur aute qui aliquip. Irure sunt enim proident est excepteur aute qui aliquip.",
            },
            {
                id: "accordion-item-2",
                title: "Accordion Item 2",
                children: "Accordion Item 2 Content",
            },
        ],
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const Mobile: Story = {
    args: {},
    parameters: {
        viewport: {
            defaultViewport: "mobile1",
        },
    },
};
