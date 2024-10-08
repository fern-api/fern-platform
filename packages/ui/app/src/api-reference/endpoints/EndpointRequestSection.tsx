import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import cn from "clsx";
import { Fragment, ReactNode } from "react";
import { Markdown } from "../../mdx/Markdown";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import {
    renderDeprecatedTypeShorthand,
    renderDeprecatedTypeShorthandFormDataProperty,
} from "../types/type-shorthand/TypeShorthand";
import { EndpointParameter, EndpointParameterContent } from "./EndpointParameter";

export declare namespace EndpointRequestSection {
    export interface Props {
        request: ApiDefinition.HttpRequest;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
    }
}

export const EndpointRequestSection: React.FC<EndpointRequestSection.Props> = ({
    request,
    onHoverProperty,
    anchorIdParts,
    slug,
    types,
}) => {
    return (
        <div className="flex flex-col">
            <Markdown
                size="sm"
                className={cn("t-muted pb-5 leading-6", {
                    "border-default border-b": request.body.type !== "formData",
                })}
                mdx={request.description}
                fallback={`This endpoint expects ${visitApiDefinition.HttpRequestBodyShape<string>(requestBody.shape, {
                    formData: (formData) => {
                        const fileArrays = formData.properties.filter(
                            (p): p is ApiDefinition.FormDataRequestProperty.FileArrayProperty => p.type === "fileArray",
                        );
                        const files = formData.properties.filter(
                            (p): p is ApiDefinition.FormDataRequestProperty.FileProperty => p.type === "file",
                        );
                        return `a multipart form${fileArrays.length > 0 || files.length > 1 ? " with multiple files" : files[0] != null ? ` containing ${files[0].isOptional ? "an optional" : "a"} file` : ""}`;
                    },
                    bytes: (bytes) => `binary data${bytes.contentType != null ? ` of type ${bytes.contentType}` : ""}`,
                    typeShape: (typeShape) => renderDeprecatedTypeShorthand(typeShape, { withArticle: true }, types),
                })}.`}
            />
            {visitApiDefinition.HttpRequestBodyShape<ReactNode | null>(requestBody.shape, {
                formData: (formData) =>
                    formData.properties.map((p) => (
                        <Fragment key={p.key}>
                            <TypeComponentSeparator />
                            {visitDiscriminatedUnion(p, "type")._visit<ReactNode | null>({
                                file: (file) => (
                                    <EndpointParameterContent
                                        name={file.key}
                                        description={file.description}
                                        typeShorthand={renderDeprecatedTypeShorthandFormDataProperty(file)}
                                        anchorIdParts={[...anchorIdParts, file.key]}
                                        slug={slug}
                                        availability={file.availability}
                                    />
                                ),
                                fileArray: (fileArray) => (
                                    <EndpointParameterContent
                                        name={fileArray.key}
                                        description={fileArray.description}
                                        typeShorthand={renderDeprecatedTypeShorthandFormDataProperty(fileArray)}
                                        anchorIdParts={[...anchorIdParts, fileArray.key]}
                                        slug={slug}
                                        availability={fileArray.availability}
                                    />
                                ),
                                bodyProperty: (bodyProperty) => (
                                    <EndpointParameter
                                        name={bodyProperty.key}
                                        description={getDescription(bodyProperty, types)}
                                        shape={bodyProperty.valueShape}
                                        anchorIdParts={[...anchorIdParts, bodyProperty.key]}
                                        slug={slug}
                                        availability={bodyProperty.availability}
                                        types={types}
                                    />
                                ),
                                _other: () => null,
                            })}
                        </Fragment>
                    )),
                bytes: () => null,
                typeShape: (typeShape) => (
                    <TypeReferenceDefinitions
                        shape={typeShape}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        anchorIdParts={anchorIdParts}
                        slug={slug}
                        applyErrorStyles={false}
                        types={types}
                    />
                ),
            })}
        </div>
    );
};

function getDescription(
    bodyProperty: ApiDefinition.FormDataRequestProperty.BodyProperty,
    types: Record<string, ApiDefinition.TypeDefinition>,
): FernDocs.MarkdownText | undefined {
    if (bodyProperty.description != null) {
        return bodyProperty.description;
    }

    return unwrapDescription(bodyProperty.valueShape, types);
}
