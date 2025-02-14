import "server-only";

import { Fragment, ReactNode } from "react";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { cn } from "@fern-docs/components";

import { DocsLoader } from "@/server/docs-loader";

import { Markdown } from "../../mdx/Markdown";
import { renderTypeShorthand } from "../../type-shorthand";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import {
  EndpointParameter,
  EndpointParameterContent,
} from "./EndpointParameter";

export function EndpointRequestSection({
  loader,
  request,
  anchorIdParts,
  slug,
  types,
}: {
  loader: DocsLoader;
  request: ApiDefinition.HttpRequest;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  return (
    <div className="flex flex-col">
      <Markdown
        size="sm"
        className={cn("t-muted pb-5 leading-6", {
          "border-default border-b": request.body.type !== "formData",
        })}
        mdx={request.description}
        fallback={`This endpoint expects ${visitDiscriminatedUnion(
          request.body
        )._visit<string>({
          formData: (formData) => {
            const fileArrays = formData.fields.filter(
              (p): p is ApiDefinition.FormDataField.Files => p.type === "files"
            );
            const files = formData.fields.filter(
              (p): p is ApiDefinition.FormDataField.File_ => p.type === "file"
            );
            return `a multipart form${fileArrays.length > 0 || files.length > 1 ? " with multiple files" : files[0] != null ? ` containing ${files[0].isOptional ? "an optional" : "a"} file` : ""}`;
          },
          bytes: (bytes) =>
            `binary data${bytes.contentType != null ? ` of type ${bytes.contentType}` : ""}`,
          object: (obj) =>
            renderTypeShorthand(obj, { withArticle: true }, types),
          alias: (alias) =>
            renderTypeShorthand(alias, { withArticle: true }, types),
        })}.`}
      />
      {visitDiscriminatedUnion(request.body)._visit<ReactNode | null>({
        formData: (formData) =>
          formData.fields.map((p) => (
            <Fragment key={p.key}>
              <TypeComponentSeparator />
              {visitDiscriminatedUnion(p, "type")._visit<ReactNode | null>({
                file: (file) => (
                  <EndpointParameterContent
                    loader={loader}
                    name={file.key}
                    description={file.description}
                    typeShorthand={renderTypeShorthandFormDataField(file)}
                    anchorIdParts={[...anchorIdParts, file.key]}
                    slug={slug}
                    availability={file.availability}
                    additionalDescriptions={undefined}
                  />
                ),
                files: (files) => (
                  <EndpointParameterContent
                    loader={loader}
                    name={files.key}
                    description={files.description}
                    typeShorthand={renderTypeShorthandFormDataField(files)}
                    anchorIdParts={[...anchorIdParts, files.key]}
                    slug={slug}
                    availability={files.availability}
                    additionalDescriptions={undefined}
                  />
                ),
                property: (property) => (
                  <EndpointParameter
                    loader={loader}
                    name={property.key}
                    description={property.description}
                    additionalDescriptions={
                      ApiDefinition.unwrapReference(property.valueShape, types)
                        .descriptions
                    }
                    shape={property.valueShape}
                    anchorIdParts={[...anchorIdParts, property.key]}
                    slug={slug}
                    availability={property.availability}
                    types={types}
                  />
                ),
                _other: () => null,
              })}
            </Fragment>
          )),
        bytes: () => null,
        object: (obj) => (
          <TypeReferenceDefinitions
            loader={loader}
            shape={obj}
            isCollapsible={false}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
        ),
        alias: (alias) => (
          <TypeReferenceDefinitions
            loader={loader}
            shape={alias}
            isCollapsible={false}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
        ),
      })}
    </div>
  );
}

function renderTypeShorthandFormDataField(
  property: Exclude<
    ApiDefinition.FormDataField,
    ApiDefinition.FormDataField.Property
  >
): ReactNode {
  return (
    <span className="fern-api-property-meta">
      <span>{property.type}</span>
      {property.isOptional ? (
        <span>Optional</span>
      ) : (
        <span className="t-danger">Required</span>
      )}
    </span>
  );
}
