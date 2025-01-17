import {
  extractAttributeValueAsString,
  isMdxJsxAttribute,
  MdxJsxElementHast,
} from "@fern-docs/mdx";
import type GithubSlugger from "github-slugger";

export function rehypeSlugJsxElementVisitor(
  node: MdxJsxElementHast,
  slugger: GithubSlugger
) {
  if (node.name === "Accordion") {
    const props = node.attributes.filter(isMdxJsxAttribute);
    const idProp = extractAttributeValueAsString(
      props.find((p) => p.name === "id")?.value
    );
    if (idProp) {
      slugger.slug(idProp);
      return;
    }
    const titleProp = extractAttributeValueAsString(
      props.find((p) => p.name === "title")?.value
    );
    if (titleProp) {
      node.attributes.unshift({
        type: "mdxJsxAttribute",
        name: "id",
        value: slugger.slug(titleProp),
      });
    }
  }
}
