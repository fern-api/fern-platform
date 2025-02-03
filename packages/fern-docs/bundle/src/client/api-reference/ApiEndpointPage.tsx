import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { useSetAtom } from "jotai";
import { ReactNode, useEffect } from "react";
import { useNavigationNodes, useWriteApiDefinitionAtom } from "../atoms";
import { ALL_ENVIRONMENTS_ATOM } from "../atoms/environment";
import { BottomNavigationNeighbors } from "../components/BottomNavigationNeighbors";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { DocsContent } from "../resolver/DocsContent";
import {
  BuiltWithFern,
  HideBuiltWithFernContext,
} from "../sidebar/BuiltWithFern";
import {
  ApiPackageContent,
  isApiPackageContentNode,
} from "./ApiPackageContent";

export default function ApiEndpointPage({
  content,
}: {
  content: DocsContent.ApiEndpointPage;
}): ReactNode {
  useWriteApiDefinitionAtom(content.apiDefinition);

  // TODO: Why are we doing this here?
  const setEnvironmentIds = useSetAtom(ALL_ENVIRONMENTS_ATOM);
  useEffect(() => {
    const ids: FernNavigation.EnvironmentId[] = [];
    Object.values(content.apiDefinition.endpoints).forEach((endpoint) => {
      endpoint.environments?.forEach((env) => {
        ids.push(env.id);
      });
    });
    Object.values(content.apiDefinition.websockets).forEach((endpoint) => {
      endpoint.environments?.forEach((env) => {
        ids.push(env.id);
      });
    });
  }, [
    content.apiDefinition.endpoints,
    content.apiDefinition.websockets,
    setEnvironmentIds,
  ]);

  const node = useNavigationNodes().get(content.nodeId);
  if (!node || !isApiPackageContentNode(node)) {
    // TODO: sentry

    console.error("Expected node to be an api reference node");
    return null;
  }

  return (
    <>
      <FernErrorBoundary component="ApiEndpointPage">
        <HideBuiltWithFernContext.Provider value={true}>
          <ApiPackageContent
            node={node}
            apiDefinition={content.apiDefinition}
            breadcrumb={content.breadcrumb}
            mdxs={EMPTY_OBJECT}
            showErrors={content.showErrors}
          />
        </HideBuiltWithFernContext.Provider>
      </FernErrorBoundary>
      <div className="px-4 md:px-6 lg:hidden lg:px-8">
        <BottomNavigationNeighbors />
      </div>
      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </>
  );
}
