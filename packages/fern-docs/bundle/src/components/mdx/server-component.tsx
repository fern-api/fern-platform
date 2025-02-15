import "server-only";

import React from "react";

import { MdxSerializer } from "@/server/mdx-serializer";

import { ErrorBoundary } from "../error-boundary";
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

export function MdxServerComponentSuspense({
  serialize,
  mdx,
  fallback,
}: {
  serialize: MdxSerializer;
  mdx: string | null | undefined;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={mdx ?? fallback}>
      <React.Suspense fallback={fallback}>
        <MdxServerComponent mdx={mdx} serialize={serialize} />
      </React.Suspense>
    </ErrorBoundary>
  );
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
  size?: "xs" | "sm" | "lg";
  className?: string;
  fallback?: React.ReactNode;
}) {
  if (mdx == null) {
    return fallback;
  }

  return (
    <Prose size={size} pre={!mdx} className={className}>
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
  size?: "xs" | "sm" | "lg";
  className?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={mdx ?? fallback}>
      <React.Suspense fallback={fallback}>
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
