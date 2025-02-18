import React from "react";

import {
  EndpointContext,
  TypeDefinition,
} from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-docs/components/badges";

import { PageHeader } from "@/components/components/PageHeader";
import { FooterLayout } from "@/components/layouts/FooterLayout";
import { ReferenceLayout } from "@/components/layouts/ReferenceLayout";
import { MdxServerComponentProseSuspense } from "@/components/mdx/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

import { TypeDefinitionRoot } from "../type-definitions/TypeDefinitionContext";
import { TypeDefinitionSlotsServer } from "../type-definitions/TypeDefinitionSlotsServer";
import { EndpointContentCodeSnippets } from "./EndpointContentCodeSnippets";
import { EndpointContentLeft } from "./EndpointContentLeft";
import { EndpointContextProvider } from "./EndpointContext";
import { EndpointUrlWithPlaygroundBaseUrl } from "./EndpointUrlWithPlaygroundBaseUrl";

export async function EndpointContent({
  serialize,
  showErrors,
  showAuth,
  context,
  breadcrumb,
  bottomNavigation,
}: {
  serialize: MdxSerializer;
  showErrors: boolean;
  showAuth: boolean;
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
            serialize={serialize}
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
            <EndpointUrlWithPlaygroundBaseUrl
              endpoint={endpoint}
              className="hidden lg:flex"
            />
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
          <TypeDefinitionRoot types={types} slug={node.slug}>
            <TypeDefinitionSlotsServer types={types} serialize={serialize}>
              <EndpointContentLeft
                serialize={serialize}
                context={context}
                showAuth={showAuth}
                showErrors={showErrors}
              />
            </TypeDefinitionSlotsServer>
          </TypeDefinitionRoot>
        }
        footer={<FooterLayout bottomNavigation={bottomNavigation} />}
      >
        <MdxServerComponentProseSuspense
          serialize={serialize}
          mdx={endpoint.description}
        />
      </ReferenceLayout>
    </EndpointContextProvider>
  );
}
