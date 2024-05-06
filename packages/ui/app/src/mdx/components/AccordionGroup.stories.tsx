import type { Meta, StoryObj } from "@storybook/react";
import { AccordionGroup } from "./AccordionGroup";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof AccordionGroup> = {
  title: "MDX/AccordionGroup",
  component: AccordionGroup,
  tags: ["autodocs"],
  args: {
    items: [
      {
        title: "Accordion Item 1",
        children: "Accordion Item 1 Content",
      },
      {
        title: "Accordion Item 2",
        children: "Accordion Item 2 Content",
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {},
};
