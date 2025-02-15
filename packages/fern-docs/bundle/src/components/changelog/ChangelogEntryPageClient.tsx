"use client";

import { ReactElement } from "react";

import { ArrowLeft } from "iconoir-react";

import { addLeadingSlash } from "@fern-docs/utils";

import { FernLink } from "../components/FernLink";
import { Markdown } from "../mdx/Markdown";
import { DocsContent } from "../resolver/DocsContent";

export default function ChangelogEntryPageClient({
  content,
}: {
  content: DocsContent.ChangelogEntryPage;
}): ReactElement<any> {
  const page = content.page;
  const title = typeof page !== "string" ? page?.frontmatter?.title : undefined;
  const excerpt =
    typeof page !== "string"
      ? (page?.frontmatter?.subtitle ?? page?.frontmatter?.excerpt)
      : undefined;
  return (
    <div className="flex justify-between px-4 md:px-6 lg:pr-16 lg:pl-8 xl:pr-0">
      <div className="w-full min-w-0 pt-8">
        <article className="mx-auto break-words lg:ml-0 xl:mx-auto">
          <section
            id={content.date}
            className="flex items-stretch justify-between"
          >
            <div className="w-sidebar-width max-xl:hidden" />
            <div className="max-w-content-width relative mr-6 min-w-0 flex-1 shrink max-xl:mx-auto">
              <header className="mb-8">
                <div className="space-y-1">
                  <div className="not-prose">
                    <FernLink href={addLeadingSlash(content.changelogSlug)}>
                      <span className="text-accent inline-flex shrink items-center gap-1 truncate text-sm font-semibold whitespace-nowrap">
                        <ArrowLeft className="size-icon" />
                        Back to {content.changelogTitle}
                      </span>
                    </FernLink>
                  </div>

                  <h1 className="my-0 inline-block leading-tight">
                    {title ?? content.title}
                  </h1>
                </div>

                <Markdown
                  mdx={excerpt}
                  size="lg"
                  className="prose-p:t-muted mt-2 leading-7"
                />
              </header>

              {/* TODO: alert if the page is null */}
              <Markdown mdx={page} />
            </div>
            <div className="-mt-2 w-72 pl-4 text-right max-xl:hidden" />
          </section>
          <div className="h-48" />
        </article>
      </div>
    </div>
  );
}
