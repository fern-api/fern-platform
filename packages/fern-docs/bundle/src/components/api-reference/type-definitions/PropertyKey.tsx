"use client";

import { composeEventHandlers } from "@radix-ui/primitive";

import { addLeadingSlash } from "@fern-docs/utils";

import { FernAnchor } from "@/components/components/FernAnchor";

import { useTypeDefinitionContext } from "./TypeDefinitionContext";

export function PropertyKey({
  slug,
  anchorId,
  children,
  ...props
}: {
  slug: string;
  anchorId: string;
} & React.ComponentPropsWithoutRef<"span">) {
  const { jsonPropertyPath } = useTypeDefinitionContext();
  const href = `${addLeadingSlash(slug)}#${anchorId}`;
  return (
    <FernAnchor href={href} sideOffset={6} asChild>
      <span
        {...props}
        onPointerEnter={composeEventHandlers(props.onPointerEnter, () => {
          window.dispatchEvent(
            new CustomEvent(`property-hover-on:${slug}`, {
              detail: jsonPropertyPath,
            })
          );
        })}
        onPointerOut={composeEventHandlers(props.onPointerOut, () => {
          window.dispatchEvent(
            new CustomEvent(`property-hover-off:${slug}`, {
              detail: jsonPropertyPath,
            })
          );
        })}
      >
        {children}
      </span>
    </FernAnchor>
  );
}
