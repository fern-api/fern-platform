import { PageHeader } from "@/components/components/PageHeader";
import { ReferenceLayout } from "@/components/layouts/ReferenceLayout";
import { Markdown } from "@/components/mdx/Markdown";
import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-docs/components/badges";
import { ApiPageCenter } from "../api-page-center";
import { EndpointContentCodeSnippets } from "./EndpointContentCodeSnippets";
import { EndpointContentLeft } from "./EndpointContentLeft";
import { EndpointContextProvider } from "./EndpointContext";
import { EndpointUrlWithPlaygroundBaseUrl } from "./EndpointUrlWithPlaygroundBaseUrl";

export async function EndpointContent({
  domain,
  showErrors,
  context,
  breadcrumb,
  rootslug,
  // streamToggle,
}: {
  domain: string;
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
            <PageHeader
              domain={domain}
              breadcrumb={breadcrumb}
              title={node.title}
              tags={
                endpoint.availability != null && (
                  <AvailabilityBadge
                    availability={endpoint.availability}
                    rounded
                  />
                )
              }
            >
              <EndpointUrlWithPlaygroundBaseUrl endpoint={endpoint} />
            </PageHeader>
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
            <EndpointContentLeft
              domain={domain}
              context={context}
              showErrors={showErrors}
            />
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
