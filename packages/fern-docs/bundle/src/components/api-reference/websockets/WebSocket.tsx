import "server-only";

import { ArrowDown, ArrowUp, Wifi } from "lucide-react";

import type { WebSocketContext } from "@fern-api/fdr-sdk/api-definition";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernScrollArea } from "@fern-docs/components";
import { AvailabilityBadge } from "@fern-docs/components/badges";

import { PageHeader } from "@/components/PageHeader";
import { FooterLayout } from "@/components/layouts/FooterLayout";
import { ReferenceLayout } from "@/components/layouts/ReferenceLayout";
import { PlaygroundKeyboardTrigger } from "@/components/playground/PlaygroundKeyboardTrigger";
import { MdxServerComponentProseSuspense } from "@/mdx/components/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

import { PlaygroundButton } from "../../playground/PlaygroundButton";
import { EndpointSection } from "../endpoints/EndpointSection";
import { EndpointUrlWithPlaygroundBaseUrl } from "../endpoints/EndpointUrlWithPlaygroundBaseUrl";
import { TitledExample } from "../examples/TitledExample";
import { ObjectProperty } from "../type-definitions/ObjectProperty";
import {
  TypeDefinitionAnchorPart,
  TypeDefinitionRoot,
} from "../type-definitions/TypeDefinitionContext";
import { WithSeparator } from "../type-definitions/TypeDefinitionDetails";
import { TypeDefinitionSlotsServer } from "../type-definitions/TypeDefinitionSlotsServer";
import { TypeReferenceDefinitions } from "../type-definitions/TypeReferenceDefinitions";
import { CardedSection } from "./CardedSection";
import { CopyWithBaseUrl } from "./CopyWithBaseUrl";
import { HandshakeExample } from "./HandshakeExample";
import { WebSocketMessage, WebSocketMessages } from "./WebSocketMessages";

export async function WebSocketContent({
  serialize,
  context,
  breadcrumb,
  bottomNavigation,
  action,
}: {
  serialize: MdxSerializer;
  context: WebSocketContext;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  bottomNavigation: React.ReactNode;
  action?: React.ReactNode;
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
    <ReferenceLayout
      header={
        <PageHeader
          serialize={serialize}
          breadcrumb={breadcrumb}
          title={node.title}
          tags={
            channel.availability != null && (
              <AvailabilityBadge availability={channel.availability} rounded />
            )
          }
          action={action}
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
        <TypeDefinitionRoot types={types} slug={node.slug}>
          <TypeDefinitionSlotsServer types={types} serialize={serialize}>
            <CardedSection
              number={1}
              title={
                <span className="inline-flex items-center gap-2">
                  {"Handshake"}
                  <span className="bg-(color:--grayscale-a3) inline-block rounded-full p-1">
                    <Wifi
                      className="text-(color:--grayscale-a11) size-icon"
                      strokeWidth={1.5}
                    />
                  </span>
                </span>
              }
              slug={node.slug}
              headingElement={
                <div className="border-border-default rounded-3 -mx-2 flex items-center justify-between border px-2 py-1 transition-colors">
                  <EndpointUrlWithPlaygroundBaseUrl endpoint={channel} />
                  <CopyWithBaseUrl channel={channel} />
                </div>
              }
            >
              <TypeDefinitionAnchorPart part="request">
                {headers && headers.length > 0 && (
                  <TypeDefinitionAnchorPart part="headers">
                    <EndpointSection title="Headers">
                      <WithSeparator>
                        {headers.map((parameter) => (
                          <ObjectProperty
                            serialize={serialize}
                            key={parameter.key}
                            property={parameter}
                            types={types}
                          />
                        ))}
                      </WithSeparator>
                    </EndpointSection>
                  </TypeDefinitionAnchorPart>
                )}
                {channel.pathParameters &&
                  channel.pathParameters.length > 0 && (
                    <TypeDefinitionAnchorPart part="path">
                      <EndpointSection title="Path parameters">
                        <WithSeparator>
                          {channel.pathParameters.map((parameter) => (
                            <ObjectProperty
                              serialize={serialize}
                              key={parameter.key}
                              property={parameter}
                              types={types}
                            />
                          ))}
                        </WithSeparator>
                      </EndpointSection>
                    </TypeDefinitionAnchorPart>
                  )}
                {channel.queryParameters &&
                  channel.queryParameters.length > 0 && (
                    <TypeDefinitionAnchorPart part="query">
                      <EndpointSection title="Query parameters">
                        <WithSeparator>
                          {channel.queryParameters.map((parameter) => {
                            return (
                              <ObjectProperty
                                serialize={serialize}
                                key={parameter.key}
                                property={parameter}
                                types={types}
                              />
                            );
                          })}
                        </WithSeparator>
                      </EndpointSection>
                    </TypeDefinitionAnchorPart>
                  )}
              </TypeDefinitionAnchorPart>
            </CardedSection>

            {publishMessages.length > 0 && (
              <TypeDefinitionAnchorPart part="send">
                <EndpointSection
                  title={
                    <span className="inline-flex items-center gap-2">
                      {"Send"}
                      <span className="text-(color:--green-a11) bg-(color:--green-a3) inline-block rounded-full p-1">
                        <ArrowUp className="size-icon" />
                      </span>
                    </span>
                  }
                >
                  <TypeReferenceDefinitions
                    serialize={serialize}
                    shape={publishMessageShape}
                    types={types}
                  />
                </EndpointSection>
              </TypeDefinitionAnchorPart>
            )}
            {subscribeMessages.length > 0 && (
              <TypeDefinitionAnchorPart part="receive">
                <EndpointSection
                  title={
                    <span className="inline-flex items-center gap-2">
                      {"Receive"}
                      <span className="text-(color:--accent-a12) bg-(color:--accent-a3) inline-block rounded-full p-1">
                        <ArrowDown className="size-icon" />
                      </span>
                    </span>
                  }
                >
                  <TypeReferenceDefinitions
                    serialize={serialize}
                    shape={subscribeMessageShape}
                    types={types}
                  />
                </EndpointSection>
              </TypeDefinitionAnchorPart>
            )}
          </TypeDefinitionSlotsServer>
        </TypeDefinitionRoot>
      }
      footer={<FooterLayout bottomNavigation={bottomNavigation} />}
    >
      <PlaygroundKeyboardTrigger />
      <MdxServerComponentProseSuspense
        serialize={serialize}
        mdx={channel.description}
      />
    </ReferenceLayout>
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
