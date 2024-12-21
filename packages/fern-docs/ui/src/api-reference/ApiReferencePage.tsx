import { ReactNode } from "react";
import {
  useIsReady,
  useNavigationNodes,
  useWriteApiDefinitionAtom,
} from "../atoms";
import { ApiPageContext } from "../contexts/api-page";
import { DocsContent } from "../resolver/DocsContent";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { ApiReferenceContent } from "./ApiReferenceContent";

export default function ApiReferencePage({
  content,
}: {
  content: DocsContent.ApiReferencePage;
}): ReactNode {
  const hydrated = useIsReady();

  useWriteApiDefinitionAtom(content.apiDefinition);

  const node = useNavigationNodes().get(content.apiReferenceNodeId);

  if (node?.type !== "apiReference") {
    // TODO: sentry

    console.error("Expected node to be an api reference node");
    return null;
  }

  return (
    <ApiPageContext.Provider value={true}>
      <ApiReferenceContent
        apiDefinition={content.apiDefinition}
        showErrors={node.showErrors ?? false}
        node={node}
        breadcrumb={content.breadcrumb}
        mdxs={content.mdxs}
        slug={content.slug}
      />

      {/* anchor links should get additional padding to scroll to on initial load */}
      {!hydrated && <div className="h-full" />}
      <div className="pb-36" />
      <div className="mx-auto my-8 w-fit">
        <BuiltWithFern />
      </div>
    </ApiPageContext.Provider>
  );
}
