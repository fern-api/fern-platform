import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { Frontmatter } from "@fern-api/fdr-sdk/docs";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { HEADER_X_FERN_HOST } from "@fern-docs/utils";

import {
  SerializeMdxResponse,
  serializeMdx as internalSerializeMdx,
} from "@/mdx/bundler/serialize";
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

export function createMdxSerializer(
  loader: Awaited<ReturnType<typeof createCachedDocsLoader>>,
  {
    scope,
  }: {
    scope?: Record<string, unknown>;
  } = {}
) {
  const domain = loader.domain;
  return async (
    content: string | undefined,
    options: MdxSerializerOptions = {}
  ) => {
    if (content == null) {
      return;
    }
    // this lets us key on just
    const uncachedSerializer = async ({
      filename,
      toc,
      scope,
      url,
    }: MdxSerializerOptions) => {
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
          `:rotating_light: [${domain}] \`Serialize MDX\` encountered an error: \`${String(error)}\` (url: \`${url ?? "unknown"}\` with the content ${content})`
        );

        return undefined;
      }
    };

    // merge the scope from the page with the scope from the serializer
    const result = await uncachedSerializer({
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

export async function remoteSerializeMdx(
  opts: MdxSerializerOptions & {
    loader: Awaited<ReturnType<typeof createCachedDocsLoader>>;
    content: string;
  }
) {
  const { loader, content, ...options } = opts;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set(HEADER_X_FERN_HOST, loader.domain);
  if (loader.fern_token) {
    headers.set("cookie", `fern_token=${loader.fern_token}`);
  }

  const response = await fetch(
    `${withDefaultProtocol(decodeURIComponent(loader.host))}/api/fern-docs/serialize`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        content,
        ...options,
      }),
      credentials: "include",
    }
  );

  return response.json() as Promise<SerializeMdxResponse | undefined>;
}

export function createRemoteMdxSerializer(
  loader: Awaited<ReturnType<typeof createCachedDocsLoader>>,
  {
    scope,
  }: {
    scope?: Record<string, unknown>;
  } = {}
) {
  return cache(
    async (content: string | undefined, options: MdxSerializerOptions = {}) => {
      if (content == null || content.trimStart() === "") {
        return;
      }
      const cachedSerializer = unstable_cache(
        async ({ ...options }: MdxSerializerOptions) => {
          return remoteSerializeMdx({ loader, content, ...options, scope });
        },
        [loader.domain, content, cacheSeed()],
        { tags: [loader.domain, "serializeMdx"] }
      );

      return cachedSerializer({ ...options, scope });
    }
  );
}
