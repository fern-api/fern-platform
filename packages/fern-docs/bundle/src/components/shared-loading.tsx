"use client";

import { cn } from "@fern-docs/components";

import { useLayout } from "@/state/layout";

import {
  CustomLayout,
  GuideLayout,
  OverviewLayout,
  PageLayout,
  ReferenceLayout,
} from "./layouts";

export default function LoadingDocs() {
  const layout = useLayout();

  const header = <PageHeaderSkeleton />;
  const toc = <TableOfContentsSkeleton />;
  const content = <ContentSkeleton />;

  switch (layout) {
    case "overview":
      return (
        <OverviewLayout header={header} toc={toc}>
          {content}
        </OverviewLayout>
      );
    case "guide":
      return (
        <GuideLayout header={header} toc={toc}>
          {content}
        </GuideLayout>
      );
    case "page":
      return <PageLayout header={header}>{content}</PageLayout>;
    case "reference":
      return (
        <ReferenceLayout header={header} aside={<EndpointSkeleton />}>
          {content}
        </ReferenceLayout>
      );
    case "custom":
      return <CustomLayout>{content}</CustomLayout>;
  }
}

function PageHeaderSkeleton() {
  return (
    <header className="my-8 space-y-2">
      <div className="w-100 bg-grayscale-a3 h-9 rounded-md" />
    </header>
  );
}

function ContentSkeleton() {
  return (
    <section className="my-8 space-y-3.5">
      <div className="bg-grayscale-a3 w-content-width h-4 max-w-full rounded-md" />
      <div className="bg-grayscale-a3 w-content-width h-4 max-w-full rounded-md" />
      <div className="bg-grayscale-a3 w-content-width h-4 max-w-full rounded-md" />
      <div className="bg-grayscale-a3 h-4 w-[calc(var(--spacing-content-width)*0.67)] max-w-full rounded-md" />
    </section>
  );
}

function TableOfContentsSkeleton() {
  return (
    <aside
      role="directory"
      className={cn(
        "top-header-height sticky order-last hidden h-fit max-h-[calc(100dvh-var(--spacing-header-height))] flex-col xl:flex",
        "w-sidebar-width"
      )}
    >
      <div className="bg-grayscale-a3 w-21 h-3.5 rounded-md" />
      <div className="border-grayscale-a3 space-y-3.5 border-l-2 pl-3">
        <div className="bg-grayscale-a3 w-38 h-3.5 rounded-md" />
        <div className="bg-grayscale-a3 w-42 h-3.5 rounded-md" />
        <div className="bg-grayscale-a3 h-3.5 w-40 rounded-md" />
      </div>
    </aside>
  );
}

function EndpointSkeleton() {
  return (
    <div className="bg-grayscale-a3 h-[calc(100svh-var(--header-height)-6rem)] w-full rounded-xl md:h-[calc(100vh-var(--header-height)-3rem)]" />
  );
}
