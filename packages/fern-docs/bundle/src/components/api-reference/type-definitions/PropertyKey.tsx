"use client";

import { composeEventHandlers } from "@radix-ui/primitive";

import { useTypeDefinitionContext } from "./TypeDefinitionContext";

export function PropertyKey({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"span">) {
  const { jsonPropertyPath, slug, isResponse } = useTypeDefinitionContext();
  return (
    <span
      {...props}
      onPointerEnter={composeEventHandlers(props.onPointerEnter, () => {
        window.dispatchEvent(
          new CustomEvent(
            `property-hover-on:${slug}:${isResponse ? "response" : "request"}`,
            {
              detail: jsonPropertyPath,
            }
          )
        );
      })}
      onPointerOut={composeEventHandlers(props.onPointerOut, () => {
        window.dispatchEvent(
          new CustomEvent(
            `property-hover-off:${slug}:${isResponse ? "response" : "request"}`,
            {
              detail: jsonPropertyPath,
            }
          )
        );
      })}
    >
      {children}
    </span>
  );
}
