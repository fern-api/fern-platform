import { compact, flatten } from "es-toolkit/array";
import { decode } from "html-entities";
import { createHash } from "crypto";
import { isNonNullish } from "@fern-api/ui-core-utils";
import {
  MarkdownSectionRoot,
  getFrontmatter,
  markdownToString,
  splitMarkdownIntoSections,
} from "@fern-docs/mdx";

import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { FernTurbopufferRecordWithoutVector } from "../types";
import { BaseRecord } from "./create-base-record";

interface CreateMarkdownRecordsOptions {
  base: BaseRecord;
  markdown: string;
  splitText: (text: string) => Promise<string[]>;
}

// TODO: the `<If>` component is not supported, and will show up in search results!
export async function createMarkdownRecords({
  base,
  markdown,
  splitText,
}: CreateMarkdownRecordsOptions): Promise<
  FernTurbopufferRecordWithoutVector[]
> {
  const { data, content } = getFrontmatter(markdown);

  /**
   * If the title is not set in the frontmatter, use the title from the sidebar.
   */
  // TODO: handle case where title is set in <h1> tag (this should be an upstream utility)
  const data_title = markdownToString(data.title);
  const title = data_title != null ? decode(data_title) : base.attributes.title;

  const sections = [...splitMarkdownIntoSections(content)];

  // meta descriptions will be pre-pended to the root node, so we need to collect them here:
  const metaDescriptions = [
    data.description,
    data.subtitle ?? data.excerpt,
    data["og:description"],
  ];

  // the root content can be missing if there is a subheading that immediately after the top of the page.
  let rootContent: string | undefined;
  if (sections[0]?.type === "root") {
    const rootSection = sections.shift() as MarkdownSectionRoot;
    rootContent = rootSection.content;
  }

  // collect all meta descriptions along with the root content, all of which can be used for string matching
  const description = [...metaDescriptions]
    .filter(isNonNullish)
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .join("\n\n");

  const {
    content: description_content,
    code_snippets: description_code_snippets,
  } = maybePrepareMdxContent(description);
  const { content: root_content, code_snippets: root_code_snippets } =
    maybePrepareMdxContent(rootContent);
  const code_snippets = flatten(
    compact([
      base.attributes.code_snippets,
      description_code_snippets?.map((c) => c.code),
      root_code_snippets?.map((c) => c.code),
    ])
  );
  const code_snippet_langs = flatten(
    compact([
      base.attributes.code_snippet_langs,
      description_code_snippets?.map((c) => c.lang ?? ""),
      root_code_snippets?.map((c) => c.lang ?? ""),
    ])
  );

  const chunked_code_snippets = flatten(
    await Promise.all([
      description_content != null ? splitText(description_content) : [],
      root_content != null ? splitText(root_content) : [],
      ...code_snippets.map((code) => splitText(code)),
    ])
  );

  const base_markdown_record: BaseRecord = {
    ...base,
    attributes: {
      ...base.attributes,
      keywords: data.keywords,
    },
  };

  const base_root_markdown_record: BaseRecord = {
    ...base_markdown_record,
    attributes: {
      ...base_markdown_record.attributes,
      title,
      hash: undefined,
      description: description_content,
      code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
      code_snippet_langs:
        code_snippet_langs.length > 0 ? code_snippet_langs : undefined,
    },
  };

  const rootRecords = chunked_code_snippets.map((chunk, i) => {
    return {
      ...base_root_markdown_record,
      id: `${base_root_markdown_record.id}-chunk:${i}`,
      attributes: {
        ...base_root_markdown_record.attributes,
        chunk,
      },
    };
  });

  const subheadingRecords = flatten(
    await Promise.all(
      sections.map(async (section, i) => {
        if (section.type === "root") {
          // the root section should have been shifted off this array earlier
          throw new Error(
            `Invariant: unexpected root section detected at index=${i + 1}`
          );
        }

        const { heading, content: markdownContent, parents } = section;

        const h1 = parents.find((p) => p.depth === 1);
        const h2 = parents.find((p) => p.depth === 2);
        const h3 = parents.find((p) => p.depth === 3);
        const h4 = parents.find((p) => p.depth === 4);
        const h5 = parents.find((p) => p.depth === 5);
        const h6 = parents.find((p) => p.depth === 6);

        const hierarchy: Record<
          "h0" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
          string | undefined
        > = {
          h0: title,
          h1: h1 ? decode(h1.title) : undefined,
          h2: h2 ? decode(h2.title) : undefined,
          h3: h3 ? decode(h3.title) : undefined,
          h4: h4 ? decode(h4.title) : undefined,
          h5: h5 ? decode(h5.title) : undefined,
          h6: h6 ? decode(h6.title) : undefined,
        };

        hierarchy[`h${heading.depth}`] = heading.title;

        const prepared = maybePrepareMdxContent(markdownContent);
        const code_snippets = flatten(
          compact([
            base.attributes.code_snippets,
            prepared.code_snippets?.map((c) => c.code),
          ])
        );

        const code_snippet_langs = flatten(
          compact([
            base.attributes.code_snippet_langs,
            prepared.code_snippets?.map((c) => c.lang ?? ""),
          ])
        );

        const chunked_content = flatten(
          await Promise.all([
            splitText(markdownContent),
            ...code_snippets.map((code) => splitText(code)),
          ])
        );

        // Note: unlike the root content, it's less important if subheadings are not indexed if there's no content inside
        // which should already been filtered out by splitMarkdownIntoSections()
        // TODO: we should probably separate this out into another record-type specifically for subheadings.
        return chunked_content.map((chunk, i) => {
          const record: FernTurbopufferRecordWithoutVector = {
            ...base_markdown_record,
            id: createHash("sha256")
              .update(`${base_root_markdown_record.id}-chunk:${i}`)
              .digest("hex"),
            attributes: {
              ...base_markdown_record.attributes,
              ...hierarchy,
              title: decode(markdownToString(heading.title)),
              hash: `#${heading.id}`,
              chunk,
              code_snippets:
                code_snippets.length > 0 ? code_snippets : undefined,
              code_snippet_langs:
                code_snippet_langs.length > 0 ? code_snippet_langs : undefined,
              level: heading.depth,
              page_position: i + 1,
            },
          };

          return record;
        });
      })
    )
  );

  return [...rootRecords, ...subheadingRecords];
}
