import { Hast, Unified, extractJsx } from "@fern-docs/mdx";

export const rehypeCollectJsx: Unified.Plugin<
  [{ collect?: (jsxElements: string[]) => void }?],
  Hast.Root
> = ({ collect } = {}) => {
  if (!collect) {
    return;
  }
  return (ast) => {
    const { jsxElements, esmElements } = extractJsx(ast);
    collect([...jsxElements, ...esmElements]);
  };
};
