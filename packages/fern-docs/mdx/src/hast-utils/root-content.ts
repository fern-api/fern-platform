import type { Doctype, ElementContent, RootContent } from "hast";
import type { MdxjsEsmHast } from "mdast-util-mdxjs-esm";
import type { Raw } from "mdast-util-to-hast";
import { UnreachableCaseError } from "ts-essentials";

interface RootContentToElementContentReturnType {
    elements: ElementContent[];
    nonelements: (MdxjsEsmHast | Doctype | Raw)[];
}

export function extractElementsFromRootContentHast(
    children: RootContent[]
): RootContentToElementContentReturnType {
    return children.reduce<RootContentToElementContentReturnType>(
        (acc, child) =>
            mergeRootContentToElementContentReturnTypes(
                acc,
                rootContentToElementContent(child)
            ),
        { elements: [], nonelements: [] }
    );
}

function rootContentToElementContent(
    child: RootContent
): RootContentToElementContentReturnType {
    switch (child.type) {
        case "comment":
        case "element":
        case "text":
        case "mdxFlowExpression":
        case "mdxJsxFlowElement":
        case "mdxJsxTextElement":
        case "mdxTextExpression":
            return { elements: [child], nonelements: [] };
        case "mdxjsEsm":
        case "doctype":
        case "raw":
            return { elements: [], nonelements: [child] };
        default:
            throw new UnreachableCaseError(child);
    }
}

function mergeRootContentToElementContentReturnTypes(
    a: RootContentToElementContentReturnType,
    b: RootContentToElementContentReturnType
): RootContentToElementContentReturnType {
    return {
        elements: [...a.elements, ...b.elements],
        nonelements: [...a.nonelements, ...b.nonelements],
    };
}
