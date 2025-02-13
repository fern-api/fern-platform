import { ArrowDown, ArrowUp, Wifi } from "iconoir-react";

import type { WebSocketContext } from "@fern-api/fdr-sdk/api-definition";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernScrollArea } from "@fern-docs/components";
import { AvailabilityBadge } from "@fern-docs/components/badges";

import { PageHeader } from "@/components/components/PageHeader";
import { ReferenceLayout } from "@/components/layouts/ReferenceLayout";
import { DocsLoader } from "@/server/docs-loader";

import { Markdown } from "../../mdx/Markdown";
import { PlaygroundButton } from "../../playground/PlaygroundButton";
import { ApiPageCenter } from "../api-page-center";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { EndpointUrlWithPlaygroundBaseUrl } from "../endpoints/EndpointUrlWithPlaygroundBaseUrl";
import { TitledExample } from "../examples/TitledExample";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { CardedSection } from "./CardedSection";
import { CopyWithBaseUrl } from "./CopyWithBaseUrl";
import { HandshakeExample } from "./HandshakeExample";
import { WebSocketMessage, WebSocketMessages } from "./WebSocketMessages";

export async function WebSocketContent({
  loader,
  context,
  breadcrumb,
}: {
  loader: DocsLoader;
  context: WebSocketContext;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const { channel, node, types, globalHeaders } = context;

  const publishMessages = channel.messages.filter(
    (message) => message.origin === APIV1Read.WebSocketMessageOrigin.Client
  );
  const subscribeMessages = channel.messages.filter(
    (message) => message.origin === APIV1Read.WebSocketMessageOrigin.Server
  );

  const publishMessageShape: ApiDefinition.TypeShape.UndiscriminatedUnion = {
    type: "undiscriminatedUnion",
    variants: flattenWebSocketShape(publishMessages, types),
  };

  const subscribeMessageShape: ApiDefinition.TypeShape.UndiscriminatedUnion = {
    type: "undiscriminatedUnion",
    variants: flattenWebSocketShape(subscribeMessages, types),
  };

  const example = channel.examples?.[0];

  const exampleMessages: WebSocketMessage[] =
    example?.messages?.map((message) => {
      const messageDefinition = channel.messages.find(
        (m) => m.type === message.type
      );
      return {
        type: message.type,
        data: message.body,
        origin: messageDefinition?.origin,
        displayName: messageDefinition?.displayName,
      };
    }) ?? [];

  // TODO: combine with auth headers like in Endpoint.tsx
  const headers = [...globalHeaders, ...(channel.requestHeaders ?? [])];

  return (
    <ApiPageCenter slug={node.slug} asChild>
      <ReferenceLayout
        header={
          <PageHeader
            loader={loader}
            breadcrumb={breadcrumb}
            title={node.title}
            tags={
              channel.availability != null && (
                <AvailabilityBadge
                  availability={channel.availability}
                  rounded
                />
              )
            }
          >
            <EndpointUrlWithPlaygroundBaseUrl endpoint={channel} />
          </PageHeader>
        }
        aside={
          <div className="grid grid-rows-[repeat(auto-fit,minmax(0,min-content))] gap-6">
            <TitledExample
              title="Handshake"
              actions={
                node != null ? <PlaygroundButton state={node} /> : undefined
              }
              disableClipboard={true}
            >
              <FernScrollArea
                className="rounded-b-[inherit]"
                rootClassName="rounded-b-[inherit]"
              >
                <HandshakeExample channel={channel} example={example} />
              </FernScrollArea>
            </TitledExample>
            {exampleMessages.length > 0 && (
              <TitledExample title={"Messages"} className="min-h-0 shrink">
                <FernScrollArea
                  className="rounded-b-[inherit]"
                  rootClassName="rounded-b-[inherit]"
                >
                  <WebSocketMessages messages={exampleMessages} />
                </FernScrollArea>
              </TitledExample>
            )}
          </div>
        }
        reference={
          <div className="space-y-12">
            <CardedSection
              number={1}
              title={
                <span className="inline-flex items-center gap-2">
                  {"Handshake"}
                  <span className="bg-tag-default inline-block rounded-full p-1">
                    <Wifi className="t-muted size-icon" strokeWidth={1.5} />
                  </span>
                </span>
              }
              slug={node.slug}
              headingElement={
                <div className="border-default -mx-2 flex items-center justify-between rounded-xl border px-2 py-1 transition-colors">
                  <EndpointUrlWithPlaygroundBaseUrl endpoint={channel} />
                  <CopyWithBaseUrl channel={channel} />
                </div>
              }
            >
              {headers && headers.length > 0 && (
                <EndpointSection
                  title="Headers"
                  anchorIdParts={["request", "headers"]}
                  slug={node.slug}
                >
                  <div className="flex flex-col">
                    {headers.map((parameter) => (
                      <div className="flex flex-col" key={parameter.key}>
                        <TypeComponentSeparator />
                        <EndpointParameter
                          name={parameter.key}
                          shape={parameter.valueShape}
                          anchorIdParts={["request", "headers", parameter.key]}
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
              {channel.pathParameters && channel.pathParameters.length > 0 && (
                <EndpointSection
                  title="Path parameters"
                  anchorIdParts={["request", "path"]}
                  slug={node.slug}
                >
                  <div className="flex flex-col">
                    {channel.pathParameters.map((parameter) => (
                      <div className="flex flex-col" key={parameter.key}>
                        <TypeComponentSeparator />
                        <EndpointParameter
                          name={parameter.key}
                          shape={parameter.valueShape}
                          anchorIdParts={["request", "path", parameter.key]}
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
              {channel.queryParameters &&
                channel.queryParameters.length > 0 && (
                  <EndpointSection
                    title="Query parameters"
                    anchorIdParts={["request", "query"]}
                    slug={node.slug}
                  >
                    <div className="flex flex-col">
                      {channel.queryParameters.map((parameter) => {
                        return (
                          <div className="flex flex-col" key={parameter.key}>
                            <TypeComponentSeparator />
                            <EndpointParameter
                              name={parameter.key}
                              shape={parameter.valueShape}
                              anchorIdParts={[
                                "request",
                                "query",
                                parameter.key,
                              ]}
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
                        );
                      })}
                    </div>
                  </EndpointSection>
                )}
            </CardedSection>

            {publishMessages.length > 0 && (
              <EndpointSection
                title={
                  <span className="inline-flex items-center gap-2">
                    {"Send"}
                    <span className="t-success bg-tag-success inline-block rounded-full p-1">
                      <ArrowUp className="size-icon" />
                    </span>
                  </span>
                }
                anchorIdParts={["send"]}
                slug={node.slug}
                headerType="h2"
              >
                <TypeReferenceDefinitions
                  shape={publishMessageShape}
                  isCollapsible={false}
                  anchorIdParts={["send"]}
                  slug={node.slug}
                  applyErrorStyles={false}
                  types={types}
                />
              </EndpointSection>
            )}
            {subscribeMessages.length > 0 && (
              <EndpointSection
                title={
                  <span className="inline-flex items-center gap-2">
                    {"Receive"}
                    <span className="t-accent-aaa bg-tag-primary inline-block rounded-full p-1">
                      <ArrowDown className="size-icon" />
                    </span>
                  </span>
                }
                anchorIdParts={["receive"]}
                slug={node.slug}
                headerType="h2"
              >
                <TypeReferenceDefinitions
                  shape={subscribeMessageShape}
                  isCollapsible={false}
                  anchorIdParts={["receive"]}
                  slug={node.slug}
                  applyErrorStyles={false}
                  types={types}
                />
              </EndpointSection>
            )}
          </div>
        }
      >
        <Markdown className="mt-4 leading-6" mdx={channel.description} />
      </ReferenceLayout>
    </ApiPageCenter>
  );
}

function flattenWebSocketShape(
  subscribeMessages: ApiDefinition.WebSocketMessage[],
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>
) {
  return subscribeMessages.flatMap(
    (message): ApiDefinition.UndiscriminatedUnionVariant[] => {
      const unwrapped = ApiDefinition.unwrapReference(message.body, types);
      if (unwrapped.shape.type === "undiscriminatedUnion") {
        return unwrapped.shape.variants;
      }
      return [
        {
          description: message.description,
          availability: message.availability,
          displayName: message.displayName ?? message.type,
          shape: message.body,
        },
      ];
    }
  );
}
