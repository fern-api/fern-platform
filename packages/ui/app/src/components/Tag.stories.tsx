import { HttpMethod } from "@fern-api/fdr-sdk/dist/client/generated/api/resources/api/resources/v1/resources/register";
import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./Tag";

const httpMethods: Array<HttpMethod | "STREAM" | "WSS"> = ["GET", "POST", "PUT", "PATCH", "DELETE", "STREAM", "WSS"];

const meta: Meta<typeof Tag> = {
  title: "General/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    children: "GET",
    size: "lg",
    variant: "subtle",
    colorScheme: "accent",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ColorSchemes: Story = {
  args: {},
  render: (args) => {
    return (
      <div className="flex flex-col gap-2 leading-none">
        {httpMethods.map((method) => (
          <Tag key={method} {...args} colorScheme={method === "GET" ? "green" : method === "DELETE" ? "red" : method === "POST" ? "blue" : (method === "STREAM" || method === "WSS") ? "accent" : "yellow"}>{method}</Tag>
        ))}
      </div>
    );
  },
};

export const Solid: Story = {
  args: {
    variant: "solid",
  },
};
