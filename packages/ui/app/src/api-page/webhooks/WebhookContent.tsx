import cn from "clsx";
import dynamic from "next/dynamic";
import React, { useCallback } from "react";
import { ResolvedTypeDefinition, ResolvedWebhookDefinition } from "../../util/resolver";
import { ApiPageDescription } from "../ApiPageDescription";
import { Breadcrumbs } from "../Breadcrumbs";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { WebhookPayloadSection } from "./WebhookPayloadSection";
import { WebhookResponseSection } from "./WebhookResponseSection";
import { useWebhookContext } from "./webhook-context/useWebhookContext";

const WebhookExample = dynamic(
    () => import("./webhook-examples/WebhookExample").then(({ WebhookExample }) => WebhookExample),
    { ssr: true },
);

export declare namespace WebhookContent {
    export interface Props {
        webhook: ResolvedWebhookDefinition;
        breadcrumbs: readonly string[];
        hideBottomSeparator?: boolean;
        setContainerRef: (ref: HTMLElement | null) => void;
        route: string;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const WebhookContent = React.memo<WebhookContent.Props>(function WebhookContent({
    webhook,
    breadcrumbs,
    hideBottomSeparator = false,
    setContainerRef,
    route,
    types,
}) {
    const { setHoveredPayloadPropertyPath } = useWebhookContext();
    const onHoverPayloadProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredPayloadPropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredPayloadPropertyPath],
    );

    const example = webhook.examples[0]; // TODO: Need a way to show all the examples

    const webhookExample = example ? <WebhookExample example={example} /> : null;

    return (
        <div className={"mx-4 scroll-mt-header-height-padded md:mx-6 lg:mx-8"}>
            <div
                className={cn(
                    "scroll-mt-header-height max-w-content-width md:max-w-endpoint-width mx-auto md:grid md:grid-cols-2 md:gap-8 lg:gap-12",
                    {
                        "border-default border-b mb-px pb-20": !hideBottomSeparator,
                    },
                )}
                ref={setContainerRef}
                data-route={route.toLowerCase()}
            >
                <div className="flex min-w-0 max-w-content-width flex-1 flex-col">
                    <div className="space-y-1 py-8">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                        <h1 className="my-0 inline-block leading-tight">{webhook.name}</h1>
                    </div>
                    <ApiPageDescription
                        className="text-base leading-6"
                        description={webhook.description}
                        isMarkdown={true}
                    />
                    {webhook.headers.length > 0 && (
                        <div className="mt-8 flex">
                            <div className="flex max-w-full flex-1 flex-col gap-12">
                                <EndpointSection title="Headers" anchorIdParts={["payload", "header"]} route={route}>
                                    <div className="flex flex-col">
                                        {webhook.headers.map((parameter) => (
                                            <div className="flex flex-col" key={parameter.key}>
                                                <TypeComponentSeparator />
                                                <EndpointParameter
                                                    name={parameter.key}
                                                    shape={parameter.valueShape}
                                                    anchorIdParts={["payload", "header", parameter.key]}
                                                    route={route}
                                                    description={parameter.description}
                                                    availability={parameter.availability}
                                                    types={types}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </EndpointSection>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex">
                        <div className="flex max-w-full flex-1 flex-col gap-12">
                            <EndpointSection title="Payload" anchorIdParts={["payload"]} route={route}>
                                <WebhookPayloadSection
                                    payload={webhook.payload}
                                    onHoverProperty={onHoverPayloadProperty}
                                    anchorIdParts={["payload", "body"]}
                                    route={route}
                                    types={types}
                                />
                            </EndpointSection>
                        </div>
                    </div>

                    <div className="mt-8 flex">
                        <div className="flex max-w-full flex-1 flex-col gap-12">
                            <EndpointSection title="Response" anchorIdParts={["response"]} route={route}>
                                <WebhookResponseSection />
                            </EndpointSection>
                        </div>
                    </div>
                </div>
                <div
                    className={cn(
                        "max-w-content-width",
                        "flex-1 sticky self-start top-header-height",
                        // the py-10 is the same as the 40px below
                        "pb-10 pt-8",
                        // the 4rem is the same as the h-10 as the Header
                        "max-h-vh-minus-header",
                        // hide on mobile,
                        "hidden md:flex",
                    )}
                >
                    {webhookExample}
                </div>

                <div className="mt-10 flex max-h-[150vh] md:mt-0 md:hidden">{webhookExample}</div>
            </div>
        </div>
    );
});
