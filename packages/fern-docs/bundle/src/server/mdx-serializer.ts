import "server-only";

import { unstable_cache } from "next/cache";

import crypto from "node:crypto";

import { serializeMdx as internalSerializeMdx } from "@/components/mdx/bundler/serialize";
import { createCachedDocsLoader } from "@/server/docs-loader";

import { FileData } from "./types";

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
  /**
   * The scope to inject into the mdx.
   */
  scope?: Record<string, unknown>;
};

export function createCachedMdxSerializer(
  loader: string | Awaited<ReturnType<typeof createCachedDocsLoader>>
) {
  const domain = typeof loader === "string" ? loader : loader.domain;
  return async (
    content: string | undefined,
    options: MdxSerializerOptions = {}
  ) => {
    if (content == null) {
      return;
    }
    const key = `${domain}:${hash(content)}`;
    const cachedSerializer = unstable_cache(
      async ({ filename, toc, scope }: MdxSerializerOptions) => {
        let files: Record<string, string> | undefined;
        let remoteFiles: Record<string, FileData> | undefined;

        const loader_ =
          typeof loader === "string"
            ? await createCachedDocsLoader(domain)
            : loader;

        // if we're serializing a page, we may need to get the files for mdx-bundler
        if (filename != null) {
          files = await loader_.getMdxBundlerFiles();
          remoteFiles = await loader_.getFiles();
        }

        const authState = await loader_.getAuthState();

        return await internalSerializeMdx(content, {
          filename,
          files,
          remoteFiles,
          toc,
          scope: {
            authed: authState.authed,
            user: authState.authed ? authState.user : undefined,
            ...scope,
          },
        });
      },
      [domain, key],
      { tags: [domain, "serializeMdx", key] }
    );

    return await cachedSerializer(options);
  };
}
