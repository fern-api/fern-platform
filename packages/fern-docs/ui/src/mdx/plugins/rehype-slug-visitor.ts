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
  if (
    node.name === "Accordion" ||
    node.name === "Tab" ||
    node.name === "Step"
  ) {
    const props = node.attributes.filter(isMdxJsxAttribute);
    const idProp = extractAttributeValueAsString(
      props.find((p) => p.name === "id")?.value
    );

    // record the slug that's already been set
    if (idProp) {
      slugger.slug(idProp);
      return;
    }

    // if no id is set, set it to the title
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
