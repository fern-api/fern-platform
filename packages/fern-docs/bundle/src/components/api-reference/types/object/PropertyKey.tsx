"use client";

import { addLeadingSlash } from "@fern-docs/utils";

import { FernAnchor } from "@/components/components/FernAnchor";

import { useTypeDefinitionContext } from "../context/TypeDefinitionContext";

export function PropertyKey({
  slug,
  anchorId,
  children,
}: {
  slug: string;
  anchorId: string;
  children: React.ReactNode;
}) {
  const { jsonPropertyPath } = useTypeDefinitionContext();
  const href = `${addLeadingSlash(slug)}#${anchorId}`;
  return (
    <FernAnchor href={href} sideOffset={6}>
      <span
        onPointerEnter={() => {
          window.dispatchEvent(
            new CustomEvent(`property-hover-on:${slug}`, {
              detail: jsonPropertyPath,
            })
          );
        }}
        onPointerOut={() => {
          window.dispatchEvent(
            new CustomEvent(`property-hover-off:${slug}`, {
              detail: jsonPropertyPath,
            })
          );
        }}
      >
        {children}
      </span>
    </FernAnchor>
  );
}
