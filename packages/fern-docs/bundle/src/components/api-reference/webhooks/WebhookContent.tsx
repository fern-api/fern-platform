import { PageHeader } from "@/components/components/PageHeader";
import { ReferenceLayout } from "@/components/layouts/ReferenceLayout";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { Markdown } from "../../mdx/Markdown";
import { ApiPageCenter } from "../api-page-center";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { WebhookPayloadSection } from "./WebhookPayloadSection";
import { WebhookResponseSection } from "./WebhookResponseSection";
import { WebhookExample } from "./webhook-examples/WebhookExample";

export declare namespace WebhookContent {
  export interface Props {
    domain: string;
    context: ApiDefinition.WebhookContext;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    last?: boolean;
  }
}

export function WebhookContent({
  domain,
  context,
  breadcrumb,
  // last = false,
}: WebhookContent.Props) {
  const { node, webhook, types } = context;

  const example = webhook.examples?.[0]; // TODO: Need a way to show all the examples

  const webhookExample = example ? <WebhookExample example={example} /> : null;

  return (
    <ApiPageCenter slug={node.slug} asChild>
      <ReferenceLayout
        header={
          <PageHeader
            domain={domain}
            breadcrumb={breadcrumb}
            title={node.title}
          />
        }
        aside={webhookExample}
        reference={
          <div className="space-y-12">
            {webhook.headers && webhook.headers.length > 0 && (
              <EndpointSection
                title="Headers"
                anchorIdParts={["payload", "header"]}
                slug={node.slug}
              >
                <div className="flex flex-col">
                  {webhook.headers.map((parameter) => (
                    <div className="flex flex-col" key={parameter.key}>
                      <TypeComponentSeparator />
                      <EndpointParameter
                        name={parameter.key}
                        shape={parameter.valueShape}
                        anchorIdParts={["payload", "header", parameter.key]}
                        slug={node.slug}
                        description={parameter.description}
                        additionalDescriptions={
                          ApiDefinition.unwrapReference(
                            parameter.valueShape,
                            types
                          ).descriptions
                        }
                        availability={parameter.availability}
                        types={types}
                      />
                    </div>
                  ))}
                </div>
              </EndpointSection>
            )}

            {webhook.payloads?.[0] && (
              <EndpointSection
                title="Payload"
                anchorIdParts={["payload"]}
                slug={node.slug}
              >
                <WebhookPayloadSection
                  payload={webhook.payloads?.[0]}
                  anchorIdParts={["payload", "body"]}
                  slug={node.slug}
                  types={types}
                />
              </EndpointSection>
            )}

            <EndpointSection
              title="Response"
              anchorIdParts={["response"]}
              slug={node.slug}
            >
              <WebhookResponseSection />
            </EndpointSection>
          </div>
        }
      >
        <Markdown className="leading-6" mdx={webhook.description} />
      </ReferenceLayout>
    </ApiPageCenter>
  );
}
