import { ResolvedRequestBody } from "@fern-ui/app-utils";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointRequestSection {
    export interface Props {
        requestBody: ResolvedRequestBody;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
        route: string;
        defaultExpandAll?: boolean;
    }
}

export const EndpointRequestSection: React.FC<EndpointRequestSection.Props> = ({
    requestBody,
    onHoverProperty,
    anchorIdParts,
    route,
    defaultExpandAll = false,
}) => {
    return (
        <div className="flex flex-col">
            <ApiPageDescription className="mt-3 text-sm" description={requestBody.description} isMarkdown={true} />
            <div className="t-muted border-border-default-light dark:border-border-default-dark border-b pb-5 text-sm leading-6">
                {`This endpoint expects ${
                    requestBody.shape.type === "fileUpload"
                        ? "a file"
                        : renderTypeShorthand(requestBody.shape, false, true)
                }.`}
            </div>
            {requestBody.shape.type === "fileUpload" ? null : (
                <TypeReferenceDefinitions
                    shape={requestBody.shape}
                    isCollapsible={false}
                    onHoverProperty={onHoverProperty}
                    anchorIdParts={anchorIdParts}
                    route={route}
                    defaultExpandAll={defaultExpandAll}
                    applyErrorStyles={false}
                />
            )}
        </div>
    );
};
