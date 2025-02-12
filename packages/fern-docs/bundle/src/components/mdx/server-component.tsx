import { MdxContent } from "./MdxContent";
import { serializeMdx } from "./bundler/serialize";

export async function MdxServerComponent({
  // domain,
  mdx,
}: {
  domain: string;
  mdx: string;
}) {
  const parsed_mdx = await serializeMdx(mdx);

  return <MdxContent mdx={parsed_mdx} fallback={mdx} />;
}
