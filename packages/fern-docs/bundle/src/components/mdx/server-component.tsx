import { createCachedMdxSerializer } from "@/server/mdx-serializer";

import { MdxContent } from "./MdxContent";

export async function MdxServerComponent({
  domain,
  mdx,
}: {
  domain: string;
  mdx: string;
}) {
  const serialize = createCachedMdxSerializer(domain);
  const parsed_mdx = await serialize(mdx);

  return <MdxContent mdx={parsed_mdx} fallback={mdx} />;
}
