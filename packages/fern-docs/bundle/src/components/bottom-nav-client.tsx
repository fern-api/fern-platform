"use client";

import React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { MaybeFernLink } from "@/components/components/FernLink";
import { Separator } from "@/components/components/Separator";

export function BottomNavigationClient({
  prev,
  next,
}: {
  prev?: {
    href?: string;
    shallow?: boolean;
    onClick?: () => void;
  };
  next?: {
    title: React.ReactNode;
    excerpt?: React.ReactNode;
    href?: string;
    shallow?: boolean;
    onClick?: () => void;
  };
}) {
  if (prev == null && next == null) {
    return <Separator />;
  }

  return (
    <nav
      aria-label="Up next"
      className="bg-(color:--grayscale-a3) max-w-content-width [&>a]:rounded-1 rounded-2 mx-auto flex p-1"
    >
      {prev && (
        <MaybeFernLink
          href={prev.href}
          className="flex h-16 shrink-0 items-center gap-1 px-3 pr-6"
          shallow={prev.shallow}
          onClick={prev.onClick}
        >
          <ChevronLeft className="size-icon text-(color:--grayscale-a9)" />
          <span className="text-(color:--grayscale-a11) hidden text-sm font-medium sm:block">
            Previous
          </span>
        </MaybeFernLink>
      )}
      {next && (
        <MaybeFernLink
          href={next.href}
          className="bg-background hover:border-(color:--accent-a9) border-(color:--grayscale-a6) flex h-16 min-w-0 flex-1 shrink items-center justify-end gap-4 border px-3"
          shallow={next.shallow}
          onClick={next.onClick}
        >
          <div className="min-w-0 shrink pl-4 text-right">
            <h4 className="text-(color:--grayscale-a12) truncate text-base font-bold">
              {next.title}
            </h4>
            {next.excerpt && (
              <div className="text-(color:--grayscale-a11) truncate text-sm [&_p]:truncate">
                {next.excerpt}
              </div>
            )}
          </div>
          <Separator
            orientation="vertical"
            className="bg-(color:--grayscale-a5) hidden h-8 w-px sm:block"
          />
          <span className="inline-flex items-center gap-1">
            <span className="text-(color:--grayscale-a11) hidden text-sm font-medium sm:block">
              Next
            </span>
            <ChevronRight className="size-icon text-(color:--grayscale-a9)" />
          </span>
        </MaybeFernLink>
      )}
    </nav>
  );
}
