"use client";

import { cn } from "@fern-docs/components";

import { useTypeDefinitionContext } from "../context/TypeDefinitionContext";

export function PropertyWrapper({
  className,
  id,
  children,
}: {
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  const contextValue = useTypeDefinitionContext();
  return (
    <div
      id={id}
      className={cn("scroll-mt-4", className, {
        "px-3": !contextValue.isRootTypeDefinition,
        // "outline-accent rounded-sm outline outline-1 outline-offset-4":
        //   isActive,
      })}
    >
      {children}
    </div>
  );
}
