import { CodeBlock } from "./CodeBlock";
import { CodeGroup } from "./CodeGroup";

/**
 * @deprecated Use `CodeGroup` instead.
 */
export function CodeBlocks({
  items,
}: {
  items: React.ComponentPropsWithoutRef<typeof CodeBlock>[];
}) {
  return (
    <CodeGroup>
      {items.map((item) => (
        <CodeBlock key={item.title} {...item} />
      ))}
    </CodeGroup>
  );
}
