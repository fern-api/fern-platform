import type { Meta, StoryObj } from "@storybook/react";

import { FernSyntaxHighlighter } from "./FernSyntaxHighlighter";

const meta: Meta<typeof FernSyntaxHighlighter> = {
  title: "Syntax/FernSyntaxHighlighter",
  component: FernSyntaxHighlighter,
};
export default meta;
type Story = StoryObj<typeof FernSyntaxHighlighter>;

export const Default: Story = {
  args: {
    code: `function greet(name) {
  console.log("Hello, {{name}}!");
  return "Greeting complete";
}

// Call the function
greet("World");`,
    language: "typescript",
    template: {
      name: "User",
    },
    tooltips: {
      name: (
        <div className="p-2">
          This is a template variable that will be replaced
        </div>
      ),
    },
  },
};

export const WithHighlightedLines: Story = {
  args: {
    code: `function greet(name) {
  console.log("Hello, {{name}}!");
  return "Greeting complete";
}

// Call the function
greet("World");`,
    language: "typescript",
    highlightLines: [2, [5, 6]],
    template: {
      name: "User",
    },
    tooltips: {
      name: (
        <div className="p-2">
          This is a template variable that will be replaced
        </div>
      ),
    },
  },
};
