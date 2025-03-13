import { CodeBlock } from "./CodeBlock";
import { CodeGroup } from "./CodeGroup";

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
