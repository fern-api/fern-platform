import "server-only";

import React from "react";

import { DocsLoader } from "@/server/docs-loader";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";

import { ErrorBoundary } from "../error-boundary";
import { MdxContent } from "./MdxContent";
import { Prose } from "./prose";

export async function MdxServerComponent({
  loader,
  mdx,
}: {
  loader: DocsLoader;
  mdx: string | null | undefined;
}) {
  if (!mdx) {
    return null;
  }

  const serialize = createCachedMdxSerializer(loader);
  const parsed_mdx = await serialize(mdx);

  return <MdxContent mdx={parsed_mdx} fallback={mdx} />;
}

export function MdxServerComponentSuspense({
  loader,
  mdx,
  fallback,
}: {
  loader: DocsLoader;
  mdx: string | null | undefined;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={mdx ?? fallback}>
      <React.Suspense fallback={fallback}>
        <MdxServerComponent mdx={mdx} loader={loader} />
      </React.Suspense>
    </ErrorBoundary>
  );
}

export function MdxServerComponentProse({
  loader,
  mdx,
  size,
  className,
  fallback,
}: {
  loader: DocsLoader;
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
      <MdxServerComponent mdx={mdx} loader={loader} />
    </Prose>
  );
}

export function MdxServerComponentProseSuspense({
  loader,
  mdx,
  size,
  className,
  fallback,
}: {
  loader: DocsLoader;
  mdx: string | null | undefined;
  size?: "xs" | "sm" | "lg";
  className?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={mdx ?? fallback}>
      <React.Suspense fallback={fallback}>
        <MdxServerComponentProse
          loader={loader}
          mdx={mdx}
          size={size}
          className={className}
          fallback={fallback}
        />
      </React.Suspense>
    </ErrorBoundary>
  );
}
