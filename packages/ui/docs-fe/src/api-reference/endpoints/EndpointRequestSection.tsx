import { FernNavigation } from "@fern-api/fdr-sdk";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-platform/core-utils";
import clsx from "clsx";
import { Fragment, ReactNode } from "react";
import { Markdown } from "../../mdx/Markdown";
import type { BundledMDX } from "../../mdx/types";
import {
    ResolvedFormDataRequestProperty,
    ResolvedRequestBody,
    ResolvedTypeDefinition,
    unwrapDescription,
    visitResolvedHttpRequestBodyShape,
} from "../../resolver/types";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand, renderTypeShorthandFormDataProperty } from "../types/type-shorthand/TypeShorthand";
import { EndpointParameter, EndpointParameterContent } from "./EndpointParameter";

export declare namespace EndpointRequestSection {
    export interface Props {
        requestBody: ResolvedRequestBody;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const EndpointRequestSection: React.FC<EndpointRequestSection.Props> = ({
    requestBody,
    onHoverProperty,
    anchorIdParts,
    slug,
    types,
}) => {
    return (
        <div className="flex flex-col">
            <Markdown
                size="sm"
                className={clsx("t-muted pb-5 leading-6", {
                    "border-default border-b": requestBody.shape.type !== "formData",
                })}
                mdx={requestBody.description}
                fallback={`This endpoint expects ${visitResolvedHttpRequestBodyShape<string>(requestBody.shape, {
                    formData: (formData) => {
                        const fileArrays = formData.properties.filter(
                            (p) => p.type === "fileArray",
                        ) as APIV1Read.FilePropertyArray[];
                        const files = formData.properties.filter(
                            (p) => p.type === "file",
                        ) as APIV1Read.FilePropertySingle[];
                        return `a multipart form${fileArrays.length > 0 || files.length > 1 ? " with multiple files" : files[0] != null ? ` containing ${files[0].isOptional ? "an optional" : "a"} file` : ""}`;
                    },
                    bytes: (bytes) => `binary data${bytes.contentType != null ? ` of type ${bytes.contentType}` : ""}`,
                    typeShape: (typeShape) => renderTypeShorthand(typeShape, { withArticle: true }, types),
                })}.`}
            />
            {visitResolvedHttpRequestBodyShape<ReactNode | null>(requestBody.shape, {
                formData: (formData) =>
                    formData.properties.map((p) => (
                        <Fragment key={p.key}>
                            <TypeComponentSeparator />
                            {visitDiscriminatedUnion(p, "type")._visit<ReactNode | null>({
                                file: (file) => (
                                    <EndpointParameterContent
                                        name={file.key}
                                        description={file.description}
                                        typeShorthand={renderTypeShorthandFormDataProperty(file)}
                                        anchorIdParts={[...anchorIdParts, file.key]}
                                        slug={slug}
                                        availability={file.availability}
                                    />
                                ),
                                fileArray: (fileArray) => (
                                    <EndpointParameterContent
                                        name={fileArray.key}
                                        description={fileArray.description}
                                        typeShorthand={renderTypeShorthandFormDataProperty(fileArray)}
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
    bodyProperty: ResolvedFormDataRequestProperty.BodyProperty,
    types: Record<string, ResolvedTypeDefinition>,
): BundledMDX | undefined {
    if (bodyProperty.description != null) {
        return bodyProperty.description;
    }

    return unwrapDescription(bodyProperty.valueShape, types);
}
