import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import cn from "clsx";
import { memo, useCallback, useRef } from "react";
import { FernBreadcrumbs } from "../../components/FernBreadcrumbs";
import { useHref } from "../../hooks/useHref";
import { Markdown } from "../../mdx/Markdown";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { WebhookPayloadSection } from "./WebhookPayloadSection";
import { WebhookResponseSection } from "./WebhookResponseSection";
import { useWebhookContext } from "./webhook-context/useWebhookContext";
import { WebhookExample } from "./webhook-examples/WebhookExample";

export declare namespace WebhookContent {
    export interface Props {
        context: ApiDefinition.WebhookContext;
        breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    }
}

export const WebhookContent = memo<WebhookContent.Props>((props) => {
    const { context, breadcrumb } = props;
    const { node, webhook, types } = context;

    const ref = useRef<HTMLDivElement>(null);
    useApiPageCenterElement(ref, node.slug);

    const { setHoveredPayloadPropertyPath } = useWebhookContext();
    const onHoverPayloadProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredPayloadPropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredPayloadPropertyPath],
    );

    const example = webhook.examples?.[0]; // TODO: Need a way to show all the examples

    const webhookExample = example ? <WebhookExample example={example} /> : null;

    return (
        <div className="fern-endpoint-content">
            <div
                className={cn(
                    "scroll-mt-content max-w-content-width md:max-w-endpoint-width mx-auto md:grid md:grid-cols-2 md:gap-8 lg:gap-12",
                    {
                        "border-default border-b mb-px pb-20": true,
                    },
                )}
                ref={ref}
                id={useHref(node.slug)}
            >
                <div className="flex min-w-0 max-w-content-width flex-1 flex-col">
                    <div className="space-y-1 py-8">
                        <FernBreadcrumbs breadcrumb={breadcrumb} />
                        <h1 className="my-0 inline-block leading-tight">{node.title}</h1>
                    </div>
                    <Markdown className="leading-6" mdx={webhook.description} />
                    {webhook.headers && webhook.headers.length > 0 && (
                        <div className="mt-8 flex">
                            <div className="flex max-w-full flex-1 flex-col gap-12">
                                <EndpointSection title="Headers" anchorIdParts={["payload", "header"]} slug={node.slug}>
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
                                                        ApiDefinition.unwrapReference(parameter.valueShape, types)
                                                            .descriptions
                                                    }
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

                    {webhook.payload && (
                        <div className="mt-8 flex">
                            <div className="flex max-w-full flex-1 flex-col gap-12">
                                <EndpointSection title="Payload" anchorIdParts={["payload"]} slug={node.slug}>
                                    <WebhookPayloadSection
                                        payload={webhook.payload}
                                        onHoverProperty={onHoverPayloadProperty}
                                        anchorIdParts={["payload", "body"]}
                                        slug={node.slug}
                                        types={types}
                                    />
                                </EndpointSection>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex">
                        <div className="flex max-w-full flex-1 flex-col gap-12">
                            <EndpointSection title="Response" anchorIdParts={["response"]} slug={node.slug}>
                                <WebhookResponseSection />
                            </EndpointSection>
                        </div>
                    </div>
                </div>
                <div
                    className={cn(
                        "max-w-content-width",
                        "flex-1 sticky self-start top-header-offset",
                        // the py-10 is the same as the 40px below
                        "pb-10 pt-8",
                        // the 4rem is the same as the h-10 as the Header
                        "max-h-content",
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

WebhookContent.displayName = "WebhookContent";
