import type { Node as HastNode } from "hast";
import type { Node as MdastNode } from "mdast";

import type { MdxExpression } from "../declarations";

export function isMdxExpression(
  node: MdastNode | HastNode
): node is MdxExpression {
  return node.type === "mdxFlowExpression" || node.type === "mdxTextExpression";
}
