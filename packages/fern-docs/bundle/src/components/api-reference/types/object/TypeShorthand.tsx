"use client";

import { TypeShapeOrReference } from "@fern-api/fdr-sdk/api-definition";

import { renderTypeShorthandRoot } from "@/components/type-shorthand";

import { useTypeDefinitionContext } from "../context/TypeDefinitionContext";

export function TypeShorthand({ shape }: { shape: TypeShapeOrReference }) {
  const context = useTypeDefinitionContext();
  return renderTypeShorthandRoot(shape, context.types, context.isResponse);
}
