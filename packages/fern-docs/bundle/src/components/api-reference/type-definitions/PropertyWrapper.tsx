"use client";

import { cn } from "@fern-docs/components";

import { useHref, useTypeDefinitionContext } from "./TypeDefinitionContext";

export function PropertyWrapper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { isRootTypeDefinition } = useTypeDefinitionContext();
  const href = useHref();
  return (
    <div
      id={href}
      className={cn("scroll-mt-4", className, {
        "px-3": !isRootTypeDefinition,
      })}
    >
      {children}
    </div>
  );
}
