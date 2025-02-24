import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";

import { Frontmatter } from "@fern-api/fdr-sdk/docs";

import { serializeMdx as internalSerializeMdx } from "@/components/mdx/bundler/serialize";
import { createCachedDocsLoader } from "@/server/docs-loader";

import { cacheSeed } from "./cache-seed";
import { hash } from "./hash";
import { FileData } from "./types";

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
  /**
   * The hash of the content to use for caching.
   */
  hash?: string;
};

export type MdxSerializer = (
  content: string | undefined,
  options?: MdxSerializerOptions
) => Promise<
  | {
      code: string;
      frontmatter?: Partial<Frontmatter>;
      jsxElements: string[];
    }
  | undefined
>;

export function createCachedMdxSerializer(
  loader: string | Awaited<ReturnType<typeof createCachedDocsLoader>>,
  {
    scope,
  }: {
    scope?: Record<string, unknown>;
  } = {}
) {
  const domain = typeof loader === "string" ? loader : loader.domain;
  return async (
    content: string | undefined,
    options: MdxSerializerOptions = {}
  ) => {
    if (content == null) {
      return;
    }
    const key = `${domain}:${options.hash ?? hash(content)}`;
    const cachedSerializer = unstable_cache(
      async ({ filename, toc, scope }: MdxSerializerOptions) => {
        const loader_ =
          typeof loader === "string"
            ? await createCachedDocsLoader(domain)
            : loader;

        const authState = await loader_.getAuthState();

        return await internalSerializeMdx(content, {
          filename,
          loader: loader_,
          toc,
          scope: {
            authed: authState.authed,
            user: authState.authed ? authState.user : undefined,
            ...scope,
          },
        });
      },
      [domain, key, cacheSeed()],
      { tags: [domain, "serializeMdx", key] }
    );

    // merge the scope from the page with the scope from the serializer
    const result = await cachedSerializer({
      ...options,
      scope: { ...options.scope, ...scope },
    });

    // if the result is undefined, we need to revalidate the cache
    // NOTE: you cannot do this because you cant revalidate the cache in a render function
    // if (result == null) {
    //   revalidateTag(key);
    // }

    return result;
  };
}
