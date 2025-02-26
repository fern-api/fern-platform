import { Hast, Unified, isMdxJsxElementHast, visit } from "@fern-docs/mdx";

export const rehypeMigrateJsx: Unified.Plugin<
  [Record<string, string>?],
  Hast.Root
> = (mapping = {}) => {
  return (ast: Hast.Root) => {
    visit(ast, (node) => {
      if (isMdxJsxElementHast(node) && node.name) {
        const newName = mapping[node.name];
        if (newName) {
          node.name = newName;
        }
      }
    });
  };
};
