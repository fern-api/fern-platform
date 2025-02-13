import "server-only";

import { DocsLoader } from "@/server/docs-loader";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";

import { MdxContent } from "./MdxContent";
import { Prose } from "./prose";

export async function MdxServerComponent({
  loader,
  mdx,
}: {
  loader: DocsLoader;
  mdx: string | null | undefined;
}) {
  if (!mdx) {
    return null;
  }

  const serialize = createCachedMdxSerializer(loader);
  const parsed_mdx = await serialize(mdx);

  return <MdxContent mdx={parsed_mdx} fallback={mdx} />;
}

export async function MdxServerComponentProse({
  loader,
  mdx,
  size,
  className,
  fallback,
}: {
  loader: DocsLoader;
  mdx: string | null | undefined;
  size?: "xs" | "sm" | "lg";
  className?: string;
  fallback?: React.ReactNode;
}) {
  if (mdx == null) {
    return fallback;
  }

  const serialize = createCachedMdxSerializer(loader);
  const parsed_mdx = await serialize(mdx);

  return (
    <Prose size={size} pre={!mdx} className={className}>
      <MdxContent mdx={parsed_mdx} fallback={mdx} />
    </Prose>
  );
}
