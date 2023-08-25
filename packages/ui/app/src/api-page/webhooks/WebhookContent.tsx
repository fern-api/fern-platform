import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import useSize from "@react-hook/size";
import classNames from "classnames";
import { snakeCase } from "lodash-es";
import React, { useCallback, useRef } from "react";
import { isSubpackage } from "../../util/package";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Markdown } from "../markdown/Markdown";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { SubpackageTitle } from "../subpackages/SubpackageTitle";
import { useWebhookContext } from "./webhook-context/useWebhookContext";
import { WebhookExample } from "./webhook-examples/WebhookExample";
import { WebhookPayloadSection } from "./WebhookPayloadSection";
import { WebhookSection } from "./WebhookSection";

export declare namespace WebhookContent {
    export interface Props {
        webhook: FernRegistryApiRead.WebhookDefinition;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        hideBottomSeparator?: boolean;
        setContainerRef: (ref: HTMLElement | null) => void;
    }
}

export const WebhookContent = React.memo<WebhookContent.Props>(function WebhookContent({
    webhook,
    package: package_,
    hideBottomSeparator = false,
    setContainerRef,
}) {
    const { setHoveredPayloadPropertyPath } = useWebhookContext();
    const onHoverPayloadProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredPayloadPropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredPayloadPropertyPath]
    );

    const computeAnchor = useCallback(
        (
            attributeType: "payload" | "response",
            attribute?:
                | FernRegistryApiRead.ObjectProperty
                | FernRegistryApiRead.PathParameter
                | FernRegistryApiRead.QueryParameter
        ) => {
            let anchor = "";
            if (isSubpackage(package_)) {
                anchor += snakeCase(package_.urlSlug) + "_";
            }
            anchor += snakeCase(webhook.id);
            anchor += "-" + attributeType;
            if (attribute?.key != null) {
                anchor += "-" + snakeCase(attribute.key);
            }
            return anchor;
        },
        [package_, webhook]
    );

    const titleSectionRef = useRef<null | HTMLDivElement>(null);
    const [, titleSectionHeight] = useSize(titleSectionRef);

    const example = webhook.examples[0]; // TODO: Need a way to show all the examples

    const webhookExample = example ? <WebhookExample example={example} /> : null;

    return (
        <ApiPageMargins
            className={classNames("pb-20", {
                "border-border-default-light dark:border-border-default-dark border-b": !hideBottomSeparator,
            })}
        >
            <div className="flex min-w-0 flex-1 flex-col lg:flex-row lg:space-x-[4vw]" ref={setContainerRef}>
                <div className="flex min-w-0 max-w-2xl flex-1 flex-col">
                    <div className="pb-8 pt-20" ref={titleSectionRef}>
                        {isSubpackage(package_) && (
                            <div className="text-accent-primary mb-4 text-xs font-semibold uppercase tracking-wider">
                                <SubpackageTitle subpackage={package_} />
                            </div>
                        )}
                        <div className="typography-font-heading text-text-primary-light dark:text-text-primary-dark text-3xl font-bold">
                            {webhook.name}
                        </div>
                    </div>
                    {webhook.description != null && (
                        <div className="mt-6">
                            <Markdown>{webhook.description}</Markdown>
                        </div>
                    )}
                    <div className="mt-8 flex">
                        <div className="flex flex-1 flex-col gap-12">
                            <WebhookSection title="Payload" anchor={computeAnchor("payload")}>
                                <WebhookPayloadSection
                                    payload={webhook.payload}
                                    onHoverProperty={onHoverPayloadProperty}
                                    getPropertyAnchor={(property) => computeAnchor("payload", property)}
                                />
                            </WebhookSection>
                        </div>
                    </div>
                </div>
                {titleSectionHeight > 0 && (
                    <div
                        className={classNames(
                            "flex-1 sticky self-start top-0 min-w-sm max-w-lg",
                            // the py-10 is the same as the 40px below
                            "py-10",
                            // the 4rem is the same as the h-10 as the Header
                            "max-h-[calc(100vh-4rem)]",
                            // hide on mobile,
                            "hidden lg:flex"
                        )}
                        style={{
                            // the 40px is the same as the py-10 above
                            marginTop: titleSectionHeight - 40,
                        }}
                    >
                        {webhookExample}
                    </div>
                )}

                <div className="mt-10 flex max-h-[150vh] lg:mt-0 lg:hidden">{webhookExample}</div>
            </div>
        </ApiPageMargins>
    );
});
