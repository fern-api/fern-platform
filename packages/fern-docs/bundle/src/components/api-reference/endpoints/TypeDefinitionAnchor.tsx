"use client";

import React from "react";

import { cn } from "@fern-docs/components";

import { FernAnchor } from "@/components/components/FernAnchor";
import { useCurrentAnchor } from "@/hooks/use-anchor";

import {
  useHref,
  useIsActive,
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
  const isActive = useIsActive();
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isActive) {
      const rIC = requestIdleCallback ?? setTimeout;
      rIC(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [isActive]);
  return (
    <SectionContainer
      ref={ref}
      {...props}
      className={cn(
        "m-3 space-y-3",
        { "mx-0": !collapsible },
        props.className,
        {
          "before:bg-(color:--accent-a3) before:rounded-1 before:absolute before:-inset-2 before:content-['']":
            isActive,
        }
      )}
    >
      {children}
    </SectionContainer>
  );
}
