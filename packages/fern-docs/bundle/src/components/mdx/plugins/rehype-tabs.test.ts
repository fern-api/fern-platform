import { hastToMarkdown, toTree } from "@fern-docs/mdx";
import { rehypeSlug } from "@fern-docs/mdx/plugins";

import { rehypeTabs } from "./rehype-tabs";

const handleTabs = (rehypeTabs as any)();
const handleSlug = (rehypeSlug as any)({
  additionalJsxElements: ["Tab"],
});

it("should convert Tabs to TabGroup", () => {
  const tree = toTree(`
    <Tabs>
      <Tab title="Tab 1">Content for Tab 1</Tab>
      <Tab title="Tab 2">Content for Tab 2</Tab>
    </Tabs>
  `).hast;

  handleTabs(tree);
  handleSlug(tree);

  expect(hastToMarkdown(tree)).toMatchInlineSnapshot(`
    "<TabGroup>
      <Tab title="Tab 1" id="tab-1">
        Content for Tab 1
      </Tab>

      <Tab title="Tab 2" id="tab-2">
        Content for Tab 2
      </Tab>
    </TabGroup>
    "
  `);
});

it("should handle nested Tabs correctly", () => {
  const tree = toTree(`
    <Tabs>
      <Tab title="Tab 1">
        <Tabs>
          <Tab title="Nested Tab 1">Content for Nested Tab 1</Tab>
        </Tabs>
      </Tab>
    </Tabs>
  `).hast;

  handleTabs(tree);
  handleSlug(tree);

  expect(hastToMarkdown(tree)).toMatchInlineSnapshot(`
    "<TabGroup>
      <Tab title="Tab 1" id="tab-1">
        <TabGroup>
          <Tab title="Nested Tab 1" id="nested-tab-1">
            Content for Nested Tab 1
          </Tab>
        </TabGroup>
      </Tab>
    </TabGroup>
    "
  `);
});

it("should handle Tabs with no children gracefully", () => {
  const tree = toTree(`
    <Tabs>
      <Tab title="Empty Tab"></Tab>
    </Tabs>
  `).hast;

  handleTabs(tree);
  handleSlug(tree);

  expect(hastToMarkdown(tree)).toMatchInlineSnapshot(`
    "<TabGroup>
      <Tab title="Empty Tab" id="empty-tab" />
    </TabGroup>
    "
  `);
});
