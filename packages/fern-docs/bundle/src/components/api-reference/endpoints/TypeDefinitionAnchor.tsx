"use client";

import { cn } from "@fern-docs/components";

import { FernAnchor } from "@/components/components/FernAnchor";

import {
  useHref,
  useTypeDefinitionContext,
} from "../type-definitions/TypeDefinitionContext";

export function TypeDefinitionAnchor({
  children,
  sideOffset,
}: {
  children: React.ReactNode;
  sideOffset?: number;
}) {
  const href = useHref();
  return (
    <FernAnchor href={href} sideOffset={sideOffset} asChild>
      <div className="inline-flex items-baseline gap-2">{children}</div>
    </FernAnchor>
  );
}

export function SectionContainer({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<"div">) {
  const href = useHref();
  return (
    <div
      id={href}
      {...props}
      className={cn("relative scroll-mt-4", props.className)}
    >
      {children}
    </div>
  );
}

export function PropertyContainer({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<"div">) {
  const { collapsible } = useTypeDefinitionContext();
  return (
    <SectionContainer
      {...props}
      className={cn("m-3 space-y-3", { "mx-0": !collapsible }, props.className)}
    >
      {children}
    </SectionContainer>
  );
}
