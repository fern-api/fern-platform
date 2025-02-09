import { ReferenceLayout } from "@/components/layouts/ReferenceLayout";
import { Markdown } from "@/components/mdx/Markdown";
import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ApiPageCenter } from "../api-page-center";
import { EndpointContentCodeSnippets } from "./EndpointContentCodeSnippets";
import { EndpointContentHeader } from "./EndpointContentHeader";
import { EndpointContentLeft } from "./EndpointContentLeft";
import { EndpointContextProvider } from "./EndpointContext";

export async function EndpointContent({
  showErrors,
  context,
  breadcrumb,
  rootslug,
  streamToggle,
}: {
  showErrors: boolean;
  context: EndpointContext;
  // hideBottomSeparator?: boolean;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  streamToggle?: React.ReactElement;
  // last?: boolean;
  rootslug: FernNavigation.Slug;
}) {
  const { node, endpoint } = context;

  return (
    <EndpointContextProvider endpoint={endpoint}>
      <ApiPageCenter slug={node.slug} asChild>
        <ReferenceLayout
          header={
            <EndpointContentHeader
              context={context}
              breadcrumb={breadcrumb}
              streamToggle={streamToggle}
            />
          }
          aside={
            <EndpointContentCodeSnippets
              rootslug={rootslug}
              endpoint={endpoint}
              showErrors={showErrors}
              node={node}
            />
          }
          reference={
            <EndpointContentLeft context={context} showErrors={showErrors} />
          }
        >
          <Markdown
            className="text-base leading-6"
            mdx={endpoint.description}
          />
        </ReferenceLayout>
      </ApiPageCenter>
    </EndpointContextProvider>
  );
}
