import { ResolvedPubSubWebsocketDefinition } from "@fern-ui/app-utils";
import React, { ReactElement } from "react";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import { ApiPageDescription } from "../ApiPageDescription";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { EndpointUrlWithOverflow } from "../endpoints/EndpointUrlWithOverflow";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";

const WEBSOCKET_MOCK: ResolvedPubSubWebsocketDefinition = {
    type: "pubSub",
    id: "websocket",
    slug: ["fern-test", "websocket-example"],
    name: "Real-time API",
    description: "Example of websocket usage",
    path: [{ type: "literal", value: "/" }],
    pathParameters: [],
    queryParameters: [
        { key: "sample_rate", shape: { type: "integer" }, description: "The sample rate of the streamed audio" },
        {
            key: "word_boost",
            shape: { type: "string" },
            description:
                "Add up to 2500 characters of custom vocabulary.\nThe parameter value must be a JSON encoded array of strings.",
        },
        {
            key: "encoding",
            shape: {
                type: "enum",
                values: [
                    { value: "pcm_s16le", description: "PCM signed 16-bit little-endian" },
                    { value: "pcm_mulaw", description: "PCM mu-law" },
                ],
            },
            description: "The encoding of the audio data",
        },
        {
            key: "token",
            shape: { type: "string" },
            description:
                "Authenticate using a [generated temporary token](https://www.assemblyai.com/docs/guides/real-time-streaming-transcription#creating-temporary-authentication-tokens)",
        },
    ],
    headers: [],
    publish: {
        description: "Send audio data to the server",
        shape: {
            type: "undiscriminatedUnion",
            variants: [
                {
                    displayName: "Send Audio",
                    shape: {
                        type: "string",
                    },
                },
                {
                    displayName: "Terminate Session",
                    shape: {
                        type: "object",
                        properties: () => [
                            {
                                key: "message_type",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        { value: "SessionBegins" },
                                        { value: "PartialTranscript" },
                                        { value: "FinalTranscript" },
                                        { value: "SessionTerminated" },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
    subscribe: {
        description: "Receive messages from the WebSocket",
        shape: {
            type: "discriminatedUnion",
            discriminant: "message_type",
            variants: [
                {
                    discriminantValue: "SessionBegins",
                    additionalProperties: [
                        { key: "session_id", valueShape: { type: "uuid" } },
                        { key: "expires_at", valueShape: { type: "datetime" } },
                    ],
                },
                {
                    discriminantValue: "PartialTranscript",
                    additionalProperties: [],
                },
                {
                    discriminantValue: "FinalTranscript",
                    additionalProperties: [],
                },
                {
                    discriminantValue: "SessionTerminated",
                    additionalProperties: [],
                },
                {
                    discriminantValue: "RealtimeError",
                    additionalProperties: [],
                },
            ],
        },
    },
    examples: [],
    defaultEnvironment: {
        id: "test",
        baseUrl: "wss://test.buildwithfern.com/v2/realtime/ws",
    },
    environments: [
        {
            id: "test",
            baseUrl: "wss://test.buildwithfern.com/v2/realtime/ws",
        },
    ],
};

export function WebSocket(): ReactElement {
    const websocket = WEBSOCKET_MOCK;
    const route = "/fern-test/websocket-example";
    return (
        <div className={"scroll-mt-header-height-padded mx-4 md:mx-6 lg:mx-8"}>
            <article className="scroll-mt-header-height max-w-content-width lg:max-w-endpoint-width mx-auto lg:grid lg:grid-cols-2 lg:gap-12">
                <section className="max-w-content-width space-y-12 py-8">
                    <header className="space-y-2.5">
                        <div>
                            {/* {subpackageTitle != null && (
                                    <div className="t-accent text-xs font-semibold uppercase tracking-wider">
                                        {subpackageTitle}
                                    </div>
                                )} */}
                            <h1 className="my-0 inline-block">{websocket.name}</h1>
                        </div>

                        <ApiPageDescription
                            className="mt-4 text-base leading-6"
                            description={websocket.description}
                            isMarkdown={true}
                        />
                    </header>
                    <main className="space-y-12">
                        <CardedSection
                            number={1}
                            title="Handshake"
                            route={route}
                            headingElement={
                                <div className="border-default hover:bg-tag-default -mx-2 flex items-center justify-between rounded-xl border px-2 py-1 hover:transition-[background]">
                                    <EndpointUrlWithOverflow
                                        path={websocket.path}
                                        method="GET"
                                        environment={websocket.defaultEnvironment?.baseUrl}
                                    />
                                    <CopyToClipboardButton
                                        className="-mr-1"
                                        content={() =>
                                            `${websocket.defaultEnvironment?.baseUrl}${websocket.path.map((path) => (path.type === "literal" ? path.value : `:${path.key}`)).join("/")}`
                                        }
                                    />
                                </div>
                            }
                        >
                            <div className="space-y-6">
                                {websocket.pathParameters.length > 0 && (
                                    <EndpointSection
                                        title="Path parameters"
                                        anchorIdParts={["request", "path"]}
                                        route={route}
                                    >
                                        <div className="flex flex-col">
                                            {websocket.pathParameters.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.shape}
                                                        anchorIdParts={["request", "path", parameter.key]}
                                                        route={route}
                                                        description={parameter.description}
                                                        descriptionContainsMarkdown={
                                                            parameter.descriptionContainsMarkdown ?? true
                                                        }
                                                        availability={parameter.availability}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </EndpointSection>
                                )}
                                {websocket.headers.length > 0 && (
                                    <EndpointSection
                                        title="Headers"
                                        anchorIdParts={["request", "header"]}
                                        route={route}
                                    >
                                        <div className="flex flex-col">
                                            {websocket.headers.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.shape}
                                                        anchorIdParts={["request", "header", parameter.key]}
                                                        route={route}
                                                        description={parameter.description}
                                                        descriptionContainsMarkdown={
                                                            parameter.descriptionContainsMarkdown ?? false
                                                        }
                                                        availability={parameter.availability}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </EndpointSection>
                                )}
                                {websocket.queryParameters.length > 0 && (
                                    <EndpointSection
                                        title="Query parameters"
                                        anchorIdParts={["request", "query"]}
                                        route={route}
                                    >
                                        <div className="flex flex-col">
                                            {websocket.queryParameters.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.shape}
                                                        anchorIdParts={["request", "query", parameter.key]}
                                                        route={route}
                                                        description={parameter.description}
                                                        descriptionContainsMarkdown={
                                                            parameter.descriptionContainsMarkdown ?? false
                                                        }
                                                        availability={parameter.availability}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </EndpointSection>
                                )}
                            </div>
                        </CardedSection>
                        {websocket.publish != null && (
                            <CardedSection number={2} title="Publish" route={route}>
                                <div className="t-muted border-default border-b pb-5 text-sm leading-6">
                                    <ApiPageDescription
                                        className="text-sm"
                                        description={websocket.publish.description}
                                        isMarkdown={true}
                                    />
                                    {websocket.publish.description == null &&
                                        `This channel expects ${renderTypeShorthand(websocket.publish.shape, {
                                            withArticle: true,
                                        })}.`}
                                </div>
                                <TypeReferenceDefinitions
                                    shape={websocket.publish.shape}
                                    isCollapsible={false}
                                    anchorIdParts={["publish", "payload"]}
                                    route={route}
                                    applyErrorStyles={false}
                                />
                            </CardedSection>
                        )}
                        {websocket.subscribe != null && (
                            <CardedSection number={3} title="Subscribe" route={route}>
                                <div className="t-muted border-default border-b pb-5 text-sm leading-6">
                                    <ApiPageDescription
                                        className="text-sm"
                                        description={websocket.subscribe.description}
                                        isMarkdown={true}
                                    />
                                    {websocket.subscribe.description == null &&
                                        `This channel emits ${renderTypeShorthand(websocket.subscribe.shape, {
                                            withArticle: true,
                                        })}.`}
                                </div>
                                <TypeReferenceDefinitions
                                    shape={websocket.subscribe.shape}
                                    isCollapsible={false}
                                    anchorIdParts={["publish", "payload"]}
                                    route={route}
                                    applyErrorStyles={false}
                                />
                            </CardedSection>
                        )}
                    </main>
                </section>
                <aside className="max-w-content-width top-header-height max-h-vh-minus-header sticky py-8">Test</aside>
            </article>
        </div>
    );
}

function CardedSection({
    number: num,
    title,
    headingElement,
    children,
    route,
    ...props
}: {
    number: number;
    title: string;
    headingElement?: React.ReactNode;
    children: React.ReactNode;
    route: string;
} & React.HTMLAttributes<HTMLDivElement>) {
    const anchorRoute = `${route}#${title}`.toLowerCase();
    return (
        <section
            {...props}
            data-route={anchorRoute}
            className="border-default divide-border-default -mx-6 divide-y rounded-2xl border shadow-xl shadow-black/5 dark:shadow-white/[0.03]"
        >
            <div className="space-y-4 rounded-t-2xl bg-black/[0.03] p-6 dark:bg-white/5">
                <h2 className="relative mt-0 flex items-center">
                    <AbsolutelyPositionedAnchor href={anchorRoute} />
                    <div className="bg-tag-default mr-2 inline-flex size-7 items-center justify-center rounded-full font-mono text-base">
                        {num}
                    </div>
                    <span>{title}</span>
                </h2>
                {headingElement}
            </div>
            <div className="p-6">{children}</div>
        </section>
    );
}
