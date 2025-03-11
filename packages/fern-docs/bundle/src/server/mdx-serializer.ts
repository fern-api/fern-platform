import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { Frontmatter } from "@fern-api/fdr-sdk/docs";

import { serializeMdx as internalSerializeMdx } from "@/mdx/bundler/serialize";
import { createCachedDocsLoader } from "@/server/docs-loader";

import { cacheSeed } from "./cache-seed";
import { postToEngineeringNotifs } from "./slack";

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
   * The URL of the page being serialized.
   */
  url?: string;
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
  loader: Awaited<ReturnType<typeof createCachedDocsLoader>>,
  {
    scope,
  }: {
    scope?: Record<string, unknown>;
  } = {}
) {
  const domain = loader.domain;
  const serializer = async (
    content: string | undefined,
    options: MdxSerializerOptions = {}
  ) => {
    if (content == null) {
      return;
    }
    // this lets us key on just
    const cachedSerializer = unstable_cache(
      async ({ filename, toc, scope, url }: MdxSerializerOptions) => {
        const authState = await loader.getAuthState();

        try {
          return await internalSerializeMdx(content, {
            filename,
            loader,
            toc,
            scope: {
              authed: authState.authed,
              user: authState.authed ? authState.user : undefined,
              ...scope,
            },
          });
        } catch (error) {
          console.error("Error serializing mdx", error);

          postToEngineeringNotifs(
            `:rotating_light: [${domain}] \`Serialize MDX\` encountered an error: \`${String(error)}\` (url: \`${url ?? "unknown"}\ with the content ${content}`)`
          );

          return undefined;
        }
      },
      [domain, content, cacheSeed()],
      { tags: [domain, "serializeMdx"] }
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

  return cache(serializer);
}
