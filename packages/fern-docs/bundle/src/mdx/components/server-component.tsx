import "server-only";

import React from "react";

import { ErrorBoundary } from "@/components/error-boundary";
import { MdxSerializer } from "@/server/mdx-serializer";

import { MdxContent } from "./MdxContent";
import { Prose } from "./prose";

export async function MdxServerComponent({
  serialize,
  mdx,
  filename,
}: {
  serialize: MdxSerializer;
  mdx: string | null | undefined;
  filename?: string;
}) {
  if (!mdx) {
    return null;
  }

  const parsed_mdx = await serialize(mdx, {
    filename,
  });

  return <MdxContent mdx={parsed_mdx} fallback={mdx} />;
}

export function MdxServerComponentProse({
  serialize,
  mdx,
  size,
  className,
  filename,
  fallback,
}: {
  serialize: MdxSerializer;
  mdx: string | null | undefined;
  size?: "xs" | "sm" | "base" | "lg";
  className?: string;
  filename?: string;
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
      <MdxServerComponent mdx={mdx} serialize={serialize} filename={filename} />
    </Prose>
  );
}

export function MdxServerComponentProseSuspense({
  serialize,
  mdx,
  size,
  className,
  fallback,
  filename,
}: {
  serialize: MdxSerializer;
  mdx: string | null | undefined;
  size?: "xs" | "sm" | "base" | "lg";
  className?: string;
  filename?: string;
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
          filename={filename}
        />
      </React.Suspense>
    </ErrorBoundary>
  );
}
