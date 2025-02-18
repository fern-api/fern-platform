import { compact } from "es-toolkit/array";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { PageHeader } from "@/components/components/PageHeader";
import { ReferenceLayout } from "@/components/layouts/ReferenceLayout";
import { Prose } from "@/components/mdx/prose";
import { renderTypeShorthand } from "@/components/type-shorthand";
import { MdxSerializer } from "@/server/mdx-serializer";

import { Markdown } from "../../mdx/Markdown";
import { ApiPageCenter } from "../api-page-center";
import { EndpointSection } from "../endpoints/EndpointSection";
import {
  ObjectProperty,
  PropertyWithShape,
} from "../type-definitions/ObjectProperty";
import {
  TypeDefinitionAnchorPart,
  TypeDefinitionRoot,
} from "../type-definitions/TypeDefinitionContext";
import { WithSeparator } from "../type-definitions/TypeDefinitionDetails";
import { TypeDefinitionSlotsServer } from "../type-definitions/TypeDefinitionSlotsServer";
import { TypeReferenceDefinitions } from "../type-definitions/TypeReferenceDefinitions";
import { WebhookResponseSection } from "./WebhookResponseSection";
import { WebhookExample } from "./webhook-examples/WebhookExample";

export async function WebhookContent({
  serialize,
  context,
  breadcrumb,
}: {
  serialize: MdxSerializer;
  context: ApiDefinition.WebhookContext;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const { node, webhook, types } = context;

  const example = webhook.examples?.[0]; // TODO: Need a way to show all the examples

  const webhookExample = example ? <WebhookExample example={example} /> : null;

  return (
    <ApiPageCenter slug={node.slug} asChild>
      <ReferenceLayout
        header={
          <PageHeader
            serialize={serialize}
            breadcrumb={breadcrumb}
            title={node.title}
          />
        }
        aside={webhookExample}
        reference={
          <TypeDefinitionRoot types={types} slug={node.slug}>
            <TypeDefinitionSlotsServer types={types} serialize={serialize}>
              <TypeDefinitionAnchorPart part="payload">
                {webhook.headers && webhook.headers.length > 0 && (
                  <TypeDefinitionAnchorPart part="header">
                    <EndpointSection title="Headers">
                      <WithSeparator>
                        {webhook.headers.map((parameter) => (
                          <TypeDefinitionAnchorPart
                            key={parameter.key}
                            part={parameter.key}
                          >
                            <ObjectProperty
                              serialize={serialize}
                              property={parameter}
                              types={types}
                            />
                          </TypeDefinitionAnchorPart>
                        ))}
                      </WithSeparator>
                    </EndpointSection>
                  </TypeDefinitionAnchorPart>
                )}

                {webhook.payloads?.[0] && (
                  <TypeDefinitionAnchorPart part="body">
                    <EndpointSection
                      title="Payload"
                      description={
                        <Prose className="text-muted my-3" size="sm">
                          {`The payload of this webhook request is ${renderTypeShorthand(webhook.payloads[0].shape, { withArticle: true }, types)}.`}
                        </Prose>
                      }
                    >
                      <TypeReferenceDefinitions
                        serialize={serialize}
                        shape={webhook.payloads?.[0].shape}
                        types={types}
                      />
                    </EndpointSection>
                  </TypeDefinitionAnchorPart>
                )}
              </TypeDefinitionAnchorPart>

              <TypeDefinitionAnchorPart part="response">
                <EndpointSection title="Response">
                  <WebhookResponseSection />
                </EndpointSection>
              </TypeDefinitionAnchorPart>
            </TypeDefinitionSlotsServer>
          </TypeDefinitionRoot>
        }
      >
        <Markdown className="leading-6" mdx={webhook.description} />
      </ReferenceLayout>
    </ApiPageCenter>
  );
}
