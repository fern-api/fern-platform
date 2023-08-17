import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Markdown } from "../markdown/Markdown";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointRequestSection {
    export interface Props {
        httpRequest: FernRegistryApiRead.HttpRequest;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        getPropertyAnchor?: (property: FernRegistryApiRead.ObjectProperty) => string;
    }
}

export const EndpointRequestSection: React.FC<EndpointRequestSection.Props> = ({
    httpRequest,
    onHoverProperty,
    getPropertyAnchor,
}) => {
    return (
        <div className="flex flex-col">
            <Markdown className="mt-3">{httpRequest.description}</Markdown>
            <div className="t-muted border-border-default-light dark:border-border-default-dark border-b pb-5 text-sm leading-6">
                {"This endpoint expects "}
                {visitDiscriminatedUnion(httpRequest.type, "type")._visit<JSX.Element | string>({
                    object: () => "an object",
                    reference: (type) => <TypeShorthand type={type.value} plural={false} withArticle />,
                    fileUpload: () => "a file",
                    _other: () => "unknown",
                })}
                .
            </div>
            {visitDiscriminatedUnion(httpRequest.type, "type")._visit({
                object: (object) => (
                    <TypeDefinition
                        typeShape={object}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        getPropertyAnchor={getPropertyAnchor}
                    />
                ),
                reference: (type) => (
                    <TypeReferenceDefinitions
                        type={type.value}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        getPropertyAnchor={getPropertyAnchor}
                    />
                ),
                fileUpload: () => null,
                _other: () => null,
            })}
        </div>
    );
};
