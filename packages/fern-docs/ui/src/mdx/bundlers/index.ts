import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { once } from "es-toolkit/function";
import { MDX_SERIALIZER } from "../bundler";

const BUNDLERS: Record<FernDocs.MdxEngine, () => Promise<MDX_SERIALIZER>> = {
  "mdx-bundler": once(
    (): Promise<MDX_SERIALIZER> =>
      import("./mdx-bundler").then(({ serializeMdx }) => serializeMdx)
  ),
  "next-mdx-remote": once(
    (): Promise<MDX_SERIALIZER> =>
      import("./next-mdx-remote").then(({ serializeMdx }) => serializeMdx)
  ),
};

export function getMdxBundler(
  engine: FernDocs.MdxEngine
): Promise<MDX_SERIALIZER> {
  return BUNDLERS[engine]();
}
