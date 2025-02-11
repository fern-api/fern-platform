import { unstable_cacheTag as cacheTag, unstable_cacheLife } from "next/cache";

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
    unstable_cacheLife("seconds");
  }

  return <MdxContent mdx={mdx} fallback={children} />;
}
