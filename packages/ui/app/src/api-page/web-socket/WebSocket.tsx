import { joinUrlSlugs, ResolvedPubSubWebsocketDefinition } from "@fern-ui/app-utils";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { HTMLAttributes, ReactNode } from "react";
import { Wifi } from "react-feather";
import { buildRequestUrl } from "../../api-playground/utils";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { CodeBlockSkeleton } from "../../commons/CodeBlockSkeleton";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import { ApiPageDescription } from "../ApiPageDescription";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { EndpointUrlWithOverflow } from "../endpoints/EndpointUrlWithOverflow";
import { TitledExample } from "../examples/TitledExample";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";

export declare namespace WebSocket {
    export interface Props {
        websocket: ResolvedPubSubWebsocketDefinition;
    }
}
export const WebSocket: React.FC<WebSocket.Props> = ({ websocket }: WebSocket.Props) => {
    const fullSlug = joinUrlSlugs(...websocket.slug);
    const route = `/${fullSlug}`;

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
                            <div className="t-accent text-xs font-semibold uppercase tracking-wider">WebSocket</div>
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
                            title={
                                <span className="inline-flex items-center gap-2">
                                    {"Handshake"}
                                    <span className="bg-tag-default inline-block rounded-full p-1">
                                        <Wifi className="t-muted size-[15px]" strokeWidth={1.5} />
                                    </span>
                                </span>
                            }
                            route={route}
                            headingElement={
                                <div className="border-default hover:bg-tag-default -mx-2 flex items-center justify-between rounded-xl border px-2 py-1 hover:transition-[background]">
                                    <EndpointUrlWithOverflow
                                        path={websocket.path}
                                        method="GET"
                                        environment={websocket.defaultEnvironment?.baseUrl}
                                        className="flex-1"
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
                        </CardedSection>
                        {websocket.publish != null && (
                            <EndpointSection
                                title={
                                    <span className="inline-flex items-center gap-2">
                                        {"Send"}
                                        <span className="bg-tag-success t-success inline-block rounded-full p-1">
                                            <ArrowUpIcon />
                                        </span>
                                    </span>
                                }
                                anchorIdParts={["publish"]}
                                route={route}
                                headerType="h2"
                            >
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
                            </EndpointSection>
                        )}
                        {websocket.subscribe != null && (
                            <EndpointSection
                                title={
                                    <span className="inline-flex items-center gap-2">
                                        {"Receive"}
                                        <span className="bg-tag-primary t-accent-aaa inline-block rounded-full p-1">
                                            <ArrowDownIcon />
                                        </span>
                                    </span>
                                }
                                anchorIdParts={["subscribe"]}
                                route={route}
                                headerType="h2"
                            >
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
                            </EndpointSection>
                        )}
                    </main>
                </section>
                <aside className="max-w-content-width top-header-height max-h-vh-minus-header sticky space-y-6 py-8">
                    <TitledExample title={"Handshake"} type={"primary"} disablePadding={true} disableClipboard={true}>
                        <div className="flex px-1 py-3">
                            <table className="min-w-0 flex-1 shrink table-fixed border-separate border-spacing-x-2 whitespace-normal break-words">
                                <tbody>
                                    <tr>
                                        <td className="text-left align-top">URL</td>
                                        <td className="text-left align-top">
                                            {buildRequestUrl(
                                                websocket.defaultEnvironment?.baseUrl,
                                                websocket.path,
                                                websocket.examples[0]?.pathParameters,
                                                websocket.examples[0]?.queryParameters,
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-left align-top">Method</td>
                                        <td className="text-left align-top">GET</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left align-top">Status</td>
                                        <td className="text-left align-top">101 Switching Protocols</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </TitledExample>
                    <TitledExample title={"Messages"} type={"primary"} disablePadding={true} disableClipboard={true}>
                        <Accordion.Root type="multiple" className="divide-border-default divide-y">
                            {websocket.examples[0]?.events.map((event, index) => (
                                <Accordion.Item
                                    value={index.toString()}
                                    key={index}
                                    className={classNames(
                                        "divide-border-default group divide-y focus-within:ring-1 ring-inset last:rounded-b-xl",
                                        {
                                            "focus-within:ring-border-success": event.action === "send",
                                            "focus-within:ring-border-primary": event.action === "recieve",
                                        },
                                    )}
                                >
                                    <Accordion.Trigger
                                        className={classNames(
                                            "w-full flex items-center gap-2 px-3 py-2 hover:data-[state=closed]:bg-tag-default cursor-default transition-background",
                                            {
                                                "data-[state=open]:bg-tag-success": event.action === "send",
                                                "data-[state=open]:bg-tag-primary": event.action === "recieve",
                                            },
                                        )}
                                    >
                                        {event.action === "send" ? (
                                            <span className="bg-tag-success t-success inline-block shrink-0 rounded-full p-0.5">
                                                <ArrowUpIcon />
                                            </span>
                                        ) : (
                                            <span className="bg-tag-primary t-accent-aaa inline-block shrink-0 rounded-full p-0.5">
                                                <ArrowDownIcon />
                                            </span>
                                        )}
                                        <span className="min-w-0 shrink truncate text-xs">
                                            {JSON.stringify(event.payload)}
                                        </span>
                                        <span
                                            className={classNames("flex-1 inline-flex justify-end", {
                                                // "justify-start": event.action === "send",
                                                // "justify-end": event.action === "recieve",
                                            })}
                                        >
                                            <span className="bg-tag-default t-muted h-5 rounded-md px-1.5 py-1 text-xs leading-none">
                                                {event.variant}
                                            </span>
                                        </span>

                                        <ChevronDownIcon
                                            className="t-muted shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                                            aria-hidden
                                        />
                                    </Accordion.Trigger>
                                    <Accordion.Content className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                                        <div className="group/cb-container relative">
                                            <CopyToClipboardButton
                                                className={
                                                    "absolute right-1 top-1 opacity-0 transition group-hover/cb-container:opacity-100"
                                                }
                                                content={() => JSON.stringify(event.payload, null, 2)}
                                            />
                                            <CodeBlockSkeleton
                                                className="max-h-[200px] w-0 min-w-full overflow-y-auto py-1"
                                                content={JSON.stringify(event.payload, null, 2)}
                                                language="json"
                                                usePlainStyles
                                                fontSize="sm"
                                            />
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                            ))}
                        </Accordion.Root>
                    </TitledExample>
                </aside>
            </article>
        </div>
    );
};

function CardedSection({
    number: num,
    title,
    headingElement,
    children,
    route,
    ...props
}: {
    number: number;
    title: ReactNode;
    headingElement: ReactNode;
    children: ReactNode;
    route: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">) {
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
                    {/* <div className="bg-tag-default mr-2 inline-flex size-7 items-center justify-center rounded-full font-mono text-base">
                        {num}
                    </div> */}
                    <span>{title}</span>
                </h2>
                {headingElement}
            </div>
            {children && <div className="space-y-12 p-6">{children}</div>}
        </section>
    );
}

const CUSTOMERS_WITH_WEBSOCKETS = ["hume"];

export function isWebsocketExampleEnabled(domain: string): boolean {
    domain = domain.toLowerCase();
    if (CUSTOMERS_WITH_WEBSOCKETS.some((customer) => domain.includes(customer))) {
        return true;
    }

    if (["docs.buildwithfern.com", "fern.docs.buildwithfern.com", "fern.docs.dev.buildwithfern.com"].includes(domain)) {
        return true;
    }

    return process.env.NODE_ENV !== "production";
}
