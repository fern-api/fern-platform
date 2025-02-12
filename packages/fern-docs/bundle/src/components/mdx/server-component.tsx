import { unstable_cacheLife, unstable_cacheTag } from "next/cache";

import { MdxContent } from "./MdxContent";
import { serializeMdx } from "./bundler/serialize";

export async function MdxServerComponent({
  domain,
  mdx,
}: {
  domain: string;
  mdx: string;
}) {
  "use cache";

  unstable_cacheTag(domain);

  const parsed_mdx = await serializeMdx(mdx);

  if (!parsed_mdx) {
    unstable_cacheLife("seconds");
  } else {
    unstable_cacheLife("days");
  }

  return <MdxContent mdx={parsed_mdx} fallback={mdx} />;
}
