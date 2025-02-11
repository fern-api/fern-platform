import { unstable_cacheTag as cacheTag } from "next/cache";
import { cacheLife } from "next/dist/server/use-cache/cache-life";

import { MdxContent } from "./MdxContent";
import { serializeMdx } from "./bundler/serialize";

export async function MdxServerComponent({
  domain,
  children,
}: {
  domain: string;
  children: string;
}) {
  "use cache";

  cacheTag(domain);

  const mdx = await serializeMdx(children);

  if (!mdx) {
    cacheLife({ stale: 0 });
  }

  return <MdxContent mdx={mdx} fallback={children} />;
}
