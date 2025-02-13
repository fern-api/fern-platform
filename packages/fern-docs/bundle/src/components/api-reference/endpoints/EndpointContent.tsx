import React from "react";

import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-docs/components/badges";

import { PageHeader } from "@/components/components/PageHeader";
import { ReferenceLayout } from "@/components/layouts/ReferenceLayout";
import { MdxServerComponentProse } from "@/components/mdx/server-component";
import { DocsLoader } from "@/server/docs-loader";

import { ApiPageCenter } from "../api-page-center";
import { EndpointContentCodeSnippets } from "./EndpointContentCodeSnippets";
import { EndpointContentLeft } from "./EndpointContentLeft";
import { EndpointContextProvider } from "./EndpointContext";
import { EndpointUrlWithPlaygroundBaseUrl } from "./EndpointUrlWithPlaygroundBaseUrl";

export async function EndpointContent({
  loader,
  showErrors,
  context,
  breadcrumb,
}: {
  loader: DocsLoader;
  showErrors: boolean;
  context: EndpointContext;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  streamToggle?: React.ReactNode;
}) {
  const { node, endpoint } = context;

  return (
    <EndpointContextProvider endpoint={endpoint}>
      <ApiPageCenter slug={node.slug} asChild>
        <ReferenceLayout
          header={
            <PageHeader
              loader={loader}
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
              endpoint={endpoint}
              showErrors={showErrors}
              node={node}
            />
          }
          reference={
            <EndpointContentLeft
              loader={loader}
              context={context}
              showErrors={showErrors}
            />
          }
        >
          <React.Suspense>
            <MdxServerComponentProse
              loader={loader}
              mdx={endpoint.description}
            />
          </React.Suspense>
        </ReferenceLayout>
      </ApiPageCenter>
    </EndpointContextProvider>
  );
}
