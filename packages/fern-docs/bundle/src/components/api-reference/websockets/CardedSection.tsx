"use client";

import React from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { addLeadingSlash } from "@fern-docs/utils";

import { getSlugFromChildren } from "@/components/util/getSlugFromText";

import { FernAnchor } from "../../components/FernAnchor";

export function CardedSection({
  // number: num,
  title,
  headingElement,
  children,
  slug,
  ...props
}: {
  number: number;
  title: React.ReactNode;
  headingElement: React.ReactNode;
  children: React.ReactNode | undefined;
  slug: FernNavigation.Slug;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "title">) {
  const href = `${addLeadingSlash(slug)}#${getSlugFromChildren(title)}`;
  return (
    <section
      {...props}
      id={href}
      className="border-border-default divide-border-default -mx-4 divide-y rounded-xl border"
    >
      <div className="bg-tag-default-soft space-y-4 rounded-t-[inherit] p-4 last:rounded-b-[inherit]">
        <FernAnchor href={href} asChild>
          <h2 className="relative mt-0 flex items-center">{title}</h2>
        </FernAnchor>
        {headingElement}
      </div>
      {React.Children.toArray(children).some((child) => child) && (
        <div className="space-y-12 p-4">{children}</div>
      )}
    </section>
  );
}
