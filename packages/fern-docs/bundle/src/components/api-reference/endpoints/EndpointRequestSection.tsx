import "server-only";

import { ReactNode } from "react";

import { compact } from "es-toolkit/array";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { MdxSerializer } from "@/server/mdx-serializer";

import { renderTypeShorthand } from "../../type-shorthand";
import {
  PropertyRenderer,
  PropertyWithShape,
} from "../type-definitions/ObjectProperty";
import { TypeDefinitionAnchorPart } from "../type-definitions/TypeDefinitionContext";
import { WithSeparator } from "../type-definitions/TypeDefinitionDetails";
import { TypeReferenceDefinitions } from "../type-definitions/TypeReferenceDefinitions";

export function EndpointRequestSection({
  serialize,
  request,
  types,
}: {
  serialize: MdxSerializer;
  request: ApiDefinition.HttpRequest;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  return visitDiscriminatedUnion(request.body)._visit({
    formData: (formData) => (
      <WithSeparator>
        {formData.fields.map((p) =>
          visitDiscriminatedUnion(p, "type")._visit({
            file: (file) => (
              <TypeDefinitionAnchorPart part={file.key} key={file.key}>
                <PropertyRenderer
                  serialize={serialize}
                  name={file.key}
                  description={file.description}
                  typeShorthand={renderTypeShorthandFormDataField(file)}
                  availability={file.availability}
                />
              </TypeDefinitionAnchorPart>
            ),
            files: (files) => (
              <TypeDefinitionAnchorPart part={files.key} key={files.key}>
                <PropertyRenderer
                  serialize={serialize}
                  name={files.key}
                  description={files.description}
                  typeShorthand={renderTypeShorthandFormDataField(files)}
                  availability={files.availability}
                />
              </TypeDefinitionAnchorPart>
            ),
            property: (property) => (
              <TypeDefinitionAnchorPart part={property.key} key={property.key}>
                <PropertyWithShape
                  serialize={serialize}
                  name={property.key}
                  description={
                    compact([
                      property.description,
                      ...ApiDefinition.unwrapReference(
                        property.valueShape,
                        types
                      ).descriptions,
                    ])[0]
                  }
                  shape={property.valueShape}
                  availability={property.availability}
                  types={types}
                />
              </TypeDefinitionAnchorPart>
            ),
            _other: () => null,
          })
        )}
      </WithSeparator>
    ),
    bytes: () => null,
    object: (obj) => (
      <TypeReferenceDefinitions
        serialize={serialize}
        shape={obj}
        types={types}
      />
    ),
    alias: (obj) => (
      <TypeReferenceDefinitions
        serialize={serialize}
        shape={obj}
        types={types}
      />
    ),
  });
}

export function createEndpointRequestDescriptionFallback(
  request: ApiDefinition.HttpRequest,
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>
) {
  return `This endpoint expects ${visitDiscriminatedUnion(
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
    object: (obj) => renderTypeShorthand(obj, { withArticle: true }, types),
    alias: (alias) => renderTypeShorthand(alias, { withArticle: true }, types),
  })}.`;
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
        <span className="text-(color:--red-a11)">Required</span>
      )}
    </span>
  );
}
