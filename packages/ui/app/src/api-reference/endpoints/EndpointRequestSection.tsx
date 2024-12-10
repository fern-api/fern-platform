import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { cn } from "@fern-ui/components";
import { Fragment, ReactNode } from "react";
import { Markdown } from "../../mdx/Markdown";
import { renderTypeShorthand } from "../../type-shorthand";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { AnchorProvider } from "./AnchorIdParts";
import { EndpointParameter, EndpointParameterContent } from "./EndpointParameter";

const EndpointRequestSection = ({
    request,
    onHoverProperty,
    types,
}: {
    request: ApiDefinition.HttpRequest;
    onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}): ReactNode => {
    return (
        <>
            <Markdown
                size="sm"
                className={cn("t-muted pb-5 leading-6", {
                    "border-default border-b": request.body.type !== "formData",
                })}
                mdx={request.description}
                fallback={createRequestBodyDescriptionFallback(request.body, types)}
            />
            <EndpointRequestBody body={request.body} types={types} onHoverProperty={onHoverProperty} />
        </>
    );
};

const EndpointRequestBody = ({
    body,
    types,
    onHoverProperty,
}: {
    body: ApiDefinition.HttpRequestBodyShape;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
    onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
}): ReactNode => {
    switch (body.type) {
        case "formData":
            return <EndpointRequestBodyFormData body={body} types={types} />;
        case "bytes":
            return false;
        case "alias":
        case "object":
            return (
                <TypeReferenceDefinitions
                    shape={body}
                    isCollapsible={false}
                    onHoverProperty={onHoverProperty}
                    applyErrorStyles={false}
                    types={types}
                />
            );
        default:
            return false;
    }
};

const EndpointRequestBodyFormData = ({
    body,
    types,
}: {
    body: ApiDefinition.HttpRequestBodyShape.FormData;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) => {
    return (
        <>
            {body.fields.map((field) => (
                <Fragment key={field.key}>
                    <TypeComponentSeparator />
                    <AnchorProvider parts={field.key}>
                        <EndpointRequestBodyFormDataField field={field} types={types} />
                    </AnchorProvider>
                </Fragment>
            ))}
        </>
    );
};

const EndpointRequestBodyFormDataField = ({
    field,
    types,
}: {
    field: ApiDefinition.FormDataField;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) => {
    switch (field.type) {
        case "file":
            return (
                <EndpointParameterContent
                    name={field.key}
                    description={field.description}
                    typeShorthand={renderTypeShorthandFormDataField(field)}
                    availability={field.availability}
                    additionalDescriptions={undefined}
                />
            );
        case "files":
            return (
                <EndpointParameterContent
                    name={field.key}
                    description={field.description}
                    typeShorthand={renderTypeShorthandFormDataField(field)}
                    availability={field.availability}
                    additionalDescriptions={undefined}
                />
            );
        case "property":
            return (
                <EndpointParameter
                    name={field.key}
                    description={field.description}
                    additionalDescriptions={ApiDefinition.unwrapReference(field.valueShape, types).descriptions}
                    shape={field.valueShape}
                    availability={field.availability}
                    types={types}
                />
            );
        default:
            return null;
    }
};

function renderTypeShorthandFormDataField(
    property: Exclude<ApiDefinition.FormDataField, ApiDefinition.FormDataField.Property>,
): ReactNode {
    return (
        <span className="fern-api-property-meta">
            <span>{property.type}</span>
            {property.isOptional ? <span>Optional</span> : <span className="t-danger">Required</span>}
        </span>
    );
}

function createRequestBodyDescriptionFallback(
    body: ApiDefinition.HttpRequestBodyShape,
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>,
): ReactNode {
    switch (body.type) {
        case "formData": {
            const fileArrays = body.fields.filter((p): p is ApiDefinition.FormDataField.Files => p.type === "files");
            const files = body.fields.filter((p): p is ApiDefinition.FormDataField.File_ => p.type === "file");
            return `This endpoint expects a multipart form${fileArrays.length > 0 || files.length > 1 ? " with multiple files" : files[0] != null ? ` containing ${files[0].isOptional ? "an optional" : "a"} file` : ""}.`;
        }
        case "bytes":
            return `This endpoint expects binary data${body.contentType != null ? ` of type ${body.contentType}` : ""}.`;
        case "object":
        case "alias":
            return `This endpoint expects ${renderTypeShorthand(body, { withArticle: true }, types)}.`;
        default:
            return "This endpoint expects an unknown type.";
    }
}

export { EndpointRequestSection };
