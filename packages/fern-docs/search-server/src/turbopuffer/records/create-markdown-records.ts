import { isNonNullish } from "@fern-api/ui-core-utils";
import { getFrontmatter, markdownToString } from "@fern-docs/mdx";
import { createHash } from "crypto";
import { compact, flatten } from "es-toolkit/array";
import { decode } from "html-entities";
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
  const data_title = markdownToString(data.title);
  const title = data_title != null ? decode(data_title) : base.attributes.title;

  // meta descriptions will be pre-pended to the content
  const metaDescriptions = [
    data.description,
    data.subtitle ?? data.excerpt,
    data["og:description"],
  ];

  // collect all meta descriptions along with the content
  const description = [...metaDescriptions]
    .filter(isNonNullish)
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .join("\n\n");

  const { content: prepared_content, code_snippets: prepared_code_snippets } =
    maybePrepareMdxContent(content);

  const code_snippets = flatten(
    compact([
      base.attributes.code_snippets,
      prepared_code_snippets?.map((c) => c.code),
    ])
  );

  const code_snippet_langs = flatten(
    compact([
      base.attributes.code_snippet_langs,
      prepared_code_snippets?.map((c) => c.lang ?? ""),
    ])
  );

  const chunked_content = flatten(
    await Promise.all([
      description ? splitText(description) : [],
      prepared_content ? splitText(prepared_content) : [],
      ...code_snippets.map((code) => splitText(code)),
    ])
  );

  const base_markdown_record: BaseRecord = {
    ...base,
    attributes: {
      ...base.attributes,
      keywords: data.keywords,
      title,
      description,
      code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
      code_snippet_langs:
        code_snippet_langs.length > 0 ? code_snippet_langs : undefined,
    },
  };

  return chunked_content
    .filter((chunk) => chunk.length > 10)
    .map((chunk, i) => {
      return {
        ...base_markdown_record,
        id: createHash("sha256")
          .update(`${base_markdown_record.id}-chunk:${i}`)
          .digest("hex"),
        attributes: {
          ...base_markdown_record.attributes,
          chunk,
          page_position: i + 1,
        },
      };
    });
}
