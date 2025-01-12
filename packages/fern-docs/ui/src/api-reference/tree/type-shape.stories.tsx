import { PropertyKey } from "@fern-api/fdr-sdk/navigation";
import type { Meta, StoryObj } from "@storybook/react";

import { Tree } from "./tree";
import { ObjectProperty } from "./type-shape";

const meta: Meta<typeof ObjectProperty> = {
  title: "API Reference/Tree/ObjectProperty",
  component: ObjectProperty,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tree.Root className="px-6">
      <ObjectProperty
        property={{
          key: PropertyKey("foo"),
          description: undefined,
          availability: undefined,
          valueShape: {
            type: "alias",
            value: {
              type: "primitive",
              value: {
                type: "string",
                regex: undefined,
                minLength: undefined,
                maxLength: undefined,
                default: undefined,
              },
            },
          },
        }}
      />
      <ObjectProperty
        property={{
          key: PropertyKey("bar"),
          description: "This property has a availability",
          availability: "Beta",
          valueShape: {
            type: "alias",
            value: {
              type: "primitive",
              value: {
                type: "string",
                regex: undefined,
                minLength: undefined,
                maxLength: undefined,
                default: undefined,
              },
            },
          },
        }}
      />
      <ObjectProperty
        property={{
          key: PropertyKey("baz"),
          description: "This property is deprecated",
          availability: "Deprecated",
          valueShape: {
            type: "alias",
            value: {
              type: "primitive",
              value: {
                type: "string",
                regex: undefined,
                minLength: undefined,
                maxLength: undefined,
                default: undefined,
              },
            },
          },
        }}
      />
      <ObjectProperty
        property={{
          key: PropertyKey("qux"),
          description: undefined,
          availability: undefined,
          valueShape: {
            type: "object",
            extends: [],
            properties: [],
            extraProperties: undefined,
          },
        }}
      />
      <ObjectProperty
        property={{
          key: PropertyKey("qux2"),
          description: undefined,
          availability: undefined,
          valueShape: {
            type: "object",
            extends: [],
            properties: [
              {
                key: PropertyKey("foo"),
                description: undefined,
                availability: undefined,
                valueShape: {
                  type: "alias",
                  value: {
                    type: "primitive",
                    value: {
                      type: "string",
                      regex: undefined,
                      minLength: undefined,
                      maxLength: undefined,
                      default: undefined,
                    },
                  },
                },
              },
            ],
            extraProperties: undefined,
          },
        }}
      />
    </Tree.Root>
  ),
};
