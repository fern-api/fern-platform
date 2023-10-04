import { getSlugForFirstNavigatableEndpointOrWebhook, UrlPathResolver } from "@fern-ui/app-utils";
import { DocsContextValue } from "../docs-context/DocsContext";

export type ResolveResult =
    | {
          slugToNavigate: string;
          pathToPush: string;
      }
    | undefined;

export async function resolveFirstNavigatableSlug(
    slug: string,
    resolver: UrlPathResolver,
    context: Pick<DocsContextValue, "docsDefinition" | "getFullSlug">
): Promise<ResolveResult> {
    const { docsDefinition, getFullSlug } = context;
    const resolvedUrlPath = await resolver.resolveSlug(slug);
    if (resolvedUrlPath?.type === "apiSubpackage") {
        const apiId = resolvedUrlPath.apiSection.api;
        const apiDefinition = docsDefinition.apis[apiId];
        if (apiDefinition == null) {
            return undefined;
        }
        const slugToNavigate = getSlugForFirstNavigatableEndpointOrWebhook(
            apiDefinition,
            [resolvedUrlPath.slug],
            resolvedUrlPath.subpackage
        );
        if (slugToNavigate != null) {
            return {
                slugToNavigate,
                pathToPush: `/${getFullSlug(slugToNavigate)}`,
            };
        }
    }
    return undefined;
}
