import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { Semaphore } from "es-toolkit/compat";

import { Frontmatter } from "@fern-api/fdr-sdk/docs";

import { serializeMdx as internalSerializeMdx } from "@/mdx/bundler/serialize";
import { RehypeLinksOptions } from "@/mdx/plugins/rehype-links";
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
   * The slug of the page being serialized.
   */
  slug?: string;
  /**
   * The function to replace links with the current version or basepath
   */
  replaceHref?: RehypeLinksOptions["replaceHref"];
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

const monitor = new Semaphore(10);

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

    await monitor.acquire();

    // this lets us key on just
    const cachedSerializer = unstable_cache(
      async ({ filename, toc, scope, slug }: MdxSerializerOptions) => {
        const authState = await loader.getAuthState();
        const { basePath, url } = await loader.getMetadata();

        console.log("basePath: ", basePath);
        console.log("url: ", url);

        function replaceHref(href: string): string | undefined {
          if (href.startsWith("/")) {
            if (basePath) {
              if (!href.startsWith(basePath)) {
                console.log(`replaceing href ${href} with ${basePath}${href}`);
                return `${basePath}${href}`;
              }
            }
          }
          return;
        }

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
            replaceHref,
          });
        } catch (error) {
          console.error("Error serializing mdx", error);

          postToEngineeringNotifs(
            `:rotating_light: [${domain}] \`Serialize MDX\` encountered an error: \`${String(error)}\` (url: \`https://${domain}/${slug ?? "UNKNOWN"}\`)`,
            {
              message: content,
              mrkdwn: true,
            }
          );

          return undefined;
        }
      },
      [domain, content, cacheSeed()],
      { tags: [domain, "serializeMdx"] }
    );

    try {
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
    } finally {
      monitor.release();
    }
  };

  return cache(serializer);
}
