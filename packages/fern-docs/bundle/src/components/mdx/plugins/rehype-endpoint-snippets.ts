import { HttpMethod } from "@fern-docs/components";
import {
  CONTINUE,
  Hast,
  MdxJsxAttributeValueExpression,
  SKIP,
  Unified,
  hastMdxJsxElementHastToProps,
  isMdxJsxElementHast,
  unknownToMdxJsxAttribute,
  visit,
} from "@fern-docs/mdx";

import { DocsLoader } from "@/server/docs-loader";

/**
 * The code below copies the `example` prop of an
 * `EndpointRequestSnippet` to the next `EndpointResponseSnippet` in the
 * tree. For this behavior to take effect, the following conditions
 * must be met:
 *
 * - The `EndpointResponseSnippet` must not have an `example` prop.
 * - The `EndpointResponseSnippet` must have the same `path` and
 * `method` props as the `EndpointRequestSnippet`.
 */
export const rehypeEndpointSnippets: Unified.Plugin<
  [{ loader: DocsLoader }?],
  Hast.Root
> = (opts) => {
  if (!opts) {
    return;
  }
  const loader = opts.loader;

  return async (ast: Hast.Root) => {
    let request:
      | {
          path: string;
          method: string;
          example: string | MdxJsxAttributeValueExpression;
        }
      | undefined;

    const promises: Promise<void>[] = [];

    visit(ast, (node, index, parent) => {
      if (!isMdxJsxElementHast(node) || index == null || parent == null) {
        return CONTINUE;
      }

      const isRequestSnippet = node.name === "EndpointRequestSnippet";
      const isResponseSnippet = node.name === "EndpointResponseSnippet";

      // check that the current node is a request or response snippet
      if (isRequestSnippet || isResponseSnippet) {
        const { props } = hastMdxJsxElementHastToProps(node);

        // cannot parse non-string endpoint prop
        if (typeof props.endpoint !== "string") {
          return CONTINUE;
        }

        const extracted = extractMethodAndPath(props.endpoint);

        // cannot parse endpoint prop
        if (extracted == null) {
          return CONTINUE;
        }

        const { method, path } = extracted;

        if (isRequestSnippet) {
          if (props.example) {
            request = {
              path,
              method,
              example: props.example,
            };
          } else {
            // reset the request reference
            request = undefined;
          }
        } else if (isResponseSnippet) {
          if (
            props.example == null &&
            request != null &&
            request.path === path &&
            request.method === method
          ) {
            node.attributes.push({
              type: "mdxJsxAttribute",
              name: "example",
              value: request.example,
            });
          }

          // reset the request reference
          request = undefined;
        }

        promises.push(
          (async () => {
            try {
              const { endpoint, slugs } = await loader.getEndpointByLocator(
                method,
                path,
                typeof props.example === "string" ? props.example : undefined
              );

              node.attributes.push(
                unknownToMdxJsxAttribute("endpointDefinition", endpoint),
                unknownToMdxJsxAttribute("slugs", slugs)
              );
            } catch (e) {
              console.error(
                `Could not find endpoint for ${method} ${path} ${props.example}`,
                e
              );
            }
          })()
        );

        return SKIP;
      }

      return CONTINUE;
    });

    if (promises.length > 0) {
      // wait for all promises to resolve before proceeding
      await Promise.all(promises);
    }
  };
};

function extractMethodAndPath(
  endpoint: string
): { method: HttpMethod; path: string } | undefined {
  const [maybeMethod, path] = endpoint.trim().split(" ");

  // parse method into APIV1Read.HttpMethod
  let method: HttpMethod | undefined;

  if (maybeMethod != null) {
    method = maybeMethod.toUpperCase() as HttpMethod;
  }

  // ensure that method is a valid HTTP method
  if (method == null || !HttpMethod[method] || path == null) {
    return undefined;
  }

  return { method, path };
}
