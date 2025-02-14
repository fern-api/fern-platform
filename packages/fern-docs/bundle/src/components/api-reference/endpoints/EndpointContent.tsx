import React from "react";

import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-docs/components/badges";

import { PageHeader } from "@/components/components/PageHeader";
import { FooterLayout } from "@/components/layouts/FooterLayout";
import { ReferenceLayout } from "@/components/layouts/ReferenceLayout";
import { MdxServerComponentProse } from "@/components/mdx/server-component";
import { DocsLoader } from "@/server/docs-loader";

import { TypeDefinitionRoot } from "../types/context/TypeDefinitionContext";
import { EndpointContentCodeSnippets } from "./EndpointContentCodeSnippets";
import { EndpointContentLeft } from "./EndpointContentLeft";
import { EndpointContextProvider } from "./EndpointContext";
import { EndpointUrlWithPlaygroundBaseUrl } from "./EndpointUrlWithPlaygroundBaseUrl";

export async function EndpointContent({
  loader,
  showErrors,
  context,
  breadcrumb,
  bottomNavigation,
}: {
  loader: DocsLoader;
  showErrors: boolean;
  context: EndpointContext;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  streamToggle?: React.ReactNode;
  bottomNavigation?: React.ReactNode;
}) {
  const { node, endpoint, types } = context;

  return (
    <EndpointContextProvider endpoint={endpoint}>
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
          <TypeDefinitionRoot types={types}>
            <EndpointContentLeft
              loader={loader}
              context={context}
              showErrors={showErrors}
            />
          </TypeDefinitionRoot>
        }
        footer={<FooterLayout bottomNavigation={bottomNavigation} />}
      >
        <React.Suspense>
          <MdxServerComponentProse loader={loader} mdx={endpoint.description} />
        </React.Suspense>
      </ReferenceLayout>
    </EndpointContextProvider>
  );
}
