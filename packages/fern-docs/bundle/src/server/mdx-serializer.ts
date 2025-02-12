import { unstable_cache } from "next/cache";

import crypto from "node:crypto";

import { createCachedDocsLoader } from "./docs-loader";

function hash(id: string): string {
  return crypto.createHash("sha256").update(id).digest("hex");
}

export type MdxSerializerOptions = {
  /**
   * The filename of the file being serialized.
   */
  filename?: string;
  /**
   * @default false
   */
  toc?: boolean;
};

export function createCachedMdxSerializer(domain: string) {
  return async (
    content: string | undefined,
    options: MdxSerializerOptions = {}
  ) => {
    if (content == null) {
      return;
    }
    const key = `${domain}:${hash(content)}`;
    const cachedSerializer = unstable_cache(
      async ({ filename, toc }: MdxSerializerOptions) => {
        const { serializeMdx: internalSerializeMdx } = await import(
          "@/components/mdx/bundler/serialize"
        );

        let files: Record<string, string> | undefined;

        // if we're serializing a page, we may need to get the files for mdx-bundler
        if (filename != null) {
          const loader = await createCachedDocsLoader(domain);
          files = await loader.getMdxBundlerFiles();
        }

        return await internalSerializeMdx(content, {
          filename,
          files,
          toc,
        });
      },
      [domain, key],
      { tags: [domain, "serializeMdx"] }
    );

    return await cachedSerializer(options);
  };
}
