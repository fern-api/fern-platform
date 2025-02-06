import { MarkdownText } from "@fern-api/fdr-sdk/docs";
import { markdownToString } from "@fern-docs/mdx";
import { BaseHit, Hit } from "instantsearch.js";
import { useEffect, useState } from "react";
import { MdxContent } from "../../mdx/MdxContent";
import { replaceBackticksWithCodeTags } from "../../util/replaceBackticksWithCodeTag";
import { replaceMarksInUrls } from "../../util/replaceMarksInUrls";

interface AlgoliaSnippetProps {
  hit: Hit<BaseHit>;
}

export const AlgoliaSnippet: React.FC<AlgoliaSnippetProps> = ({ hit }) => {
  const [mdx, setMdx] = useState<MarkdownText>();
  useEffect(() => {
    (async () => {
      const maybeHitSnippet =
        hit._highlightResult?.content ||
        hit._highlightResult?.description ||
        hit._highlightResult?.title ||
        hit._highlightResult?.slug;

      if (maybeHitSnippet) {
        let snippetToRender;

        if (Array.isArray(maybeHitSnippet)) {
          snippetToRender = maybeHitSnippet[0];
        } else {
          snippetToRender = maybeHitSnippet;
        }

        if (snippetToRender && typeof snippetToRender.value === "string") {
          let snippet;
          let inCodeBlock = false;

          for (const line of snippetToRender.value.split("\n")) {
            if (line.match(/```/)) {
              inCodeBlock = !inCodeBlock;
            }
            if (line.match(/<mark>.*<\/mark>/)) {
              snippet = replaceBackticksWithCodeTags(replaceMarksInUrls(line));
              break;
            }
          }
          if (inCodeBlock) {
            snippet = `<code>${snippet}</code>`;
          }

          const removeOutsideGuards = snippet?.match(/\| (.*) \|/);
          if (removeOutsideGuards && removeOutsideGuards?.length > 1) {
            snippet = removeOutsideGuards[1];
          }

          setMdx(
            markdownToString(
              new DOMParser()
                .parseFromString(snippet ?? "", "text/html")
                .body.innerHTML.replaceAll(
                  "<mark>",
                  '<mark class="fern-highlight">'
                )
            )
          );
        }
      }
    })().catch(() => undefined);
  }, [hit]);

  return mdx ? <MdxContent mdx={mdx} /> : <></>;
};
