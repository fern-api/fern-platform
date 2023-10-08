import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { ApiPageDescription } from "../ApiPageDescription";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";

export declare namespace WebhookHeadersSection {
    export interface Props {
        webhook: FernRegistryApiRead.WebhookDefinition;
        anchorIdParts: string[];
    }
}

export const WebhookHeadersSection: React.FC<WebhookHeadersSection.Props> = ({ webhook, anchorIdParts }) => {
    return (
        <div className="flex flex-col">
            {webhook.headers.map((header, index) => (
                <div className="flex flex-col" key={index}>
                    <TypeComponentSeparator />
                    <div className="group/anchor-container relative flex flex-col gap-2 py-3">
                        <div className="flex items-baseline gap-1">
                            <MonospaceText className="text-text-primary-light dark:text-text-primary-dark">
                                {header.key}
                            </MonospaceText>
                            <div className="t-muted text-xs">
                                <TypeShorthand type={header.type} plural={false} />
                            </div>
                        </div>
                        <ApiPageDescription description={header.description} isMarkdown={true} />
                        <TypeReferenceDefinitions
                            type={header.type}
                            isCollapsible
                            anchorIdParts={anchorIdParts}
                            applyErrorStyles={false}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
