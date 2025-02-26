import "server-only";

import React from "react";

import { MdxSerializer } from "@/server/mdx-serializer";

import { ErrorBoundary } from "../../components/error-boundary";
import { MdxContent } from "./MdxContent";
import { Prose } from "./prose";

export async function MdxServerComponent({
  serialize,
  mdx,
}: {
  serialize: MdxSerializer;
  mdx: string | null | undefined;
}) {
  if (!mdx) {
    return null;
  }

  const parsed_mdx = await serialize(mdx);

  return <MdxContent mdx={parsed_mdx} fallback={mdx} />;
}

export function MdxServerComponentProse({
  serialize,
  mdx,
  size,
  className,
  fallback,
}: {
  serialize: MdxSerializer;
  mdx: string | null | undefined;
  size?: "xs" | "sm" | "base" | "lg";
  className?: string;
  fallback?: React.ReactNode;
}) {
  if (!mdx) {
    return (
      <Prose size={size} className={className}>
        {mdx ?? fallback}
      </Prose>
    );
  }

  return (
    <Prose size={size} className={className}>
      <MdxServerComponent mdx={mdx} serialize={serialize} />
    </Prose>
  );
}

export function MdxServerComponentProseSuspense({
  serialize,
  mdx,
  size,
  className,
  fallback,
}: {
  serialize: MdxSerializer;
  mdx: string | null | undefined;
  size?: "xs" | "sm" | "base" | "lg";
  className?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <Prose size={size} pre={mdx != null} className={className}>
          {mdx ?? fallback}
        </Prose>
      }
    >
      <React.Suspense
        fallback={
          <Prose size={size} className={className}>
            {mdx ?? fallback}
          </Prose>
        }
      >
        <MdxServerComponentProse
          serialize={serialize}
          mdx={mdx}
          size={size}
          className={className}
          fallback={fallback}
        />
      </React.Suspense>
    </ErrorBoundary>
  );
}
