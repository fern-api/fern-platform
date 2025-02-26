import { jsx, toJs } from "estree-util-to-js";
import { toEstree } from "hast-util-to-estree";

import { isNonNullish } from "@fern-api/ui-core-utils";
import {
  CONTINUE,
  Hast,
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  SKIP,
  Unified,
  isHastElement,
  isMdxJsxElementHast,
  unknownToMdxJsxAttribute,
  visit,
} from "@fern-docs/mdx";

/**
 * The code below converts `<Steps>` and `<StepGroup>` components
 * into `<Step>` components.
 */
export const rehypeSteps: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node, index, parent) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Steps") {
        node.name = "StepGroup";
      }

      if (node.name === "StepGroup") {
        // if there are `<Step>` components, we can assume that the
        // children are already in the correct format
        if (
          node.children.some(
            (child) => isMdxJsxElementHast(child) && child.name === "Step"
          )
        ) {
          // must continue because there may be steps within steps.
          return CONTINUE;
        }

        migrateStepGroup(node);

        // continue traversing the new children of this step group
        return CONTINUE;
      }

      // ensure that the Step component is surrounded by a StepGroup component
      if (node.name === "Step" && parent != null && index != null) {
        if (isMdxJsxElementHast(parent) && parent.name === "StepGroup") {
          return CONTINUE;
        }

        const stepGroup = {
          type: "mdxJsxFlowElement" as const,
          name: "StepGroup",
          children: [node],
          attributes: [],
        };

        parent.children[index] = stepGroup;

        // revisit the current node to traverse its children
        return [SKIP, index];
      }

      return CONTINUE;
    });
  };
};

function migrateStepGroup(node: Hast.MdxJsxElement) {
  // get the "largest" heading rank (up to h3)
  const largestRanking = Math.min(
    3,
    ...node.children
      .flatMap((child) =>
        isHastElement(child)
          ? child.tagName
          : isMdxJsxElementHast(child)
            ? child.name?.toLowerCase()
            : null
      )
      .map((rank) => {
        if (rank === "h1") return 1;
        if (rank === "h2") return 2;
        if (rank === "h3") return 3;
        return undefined;
      })
      .filter(isNonNullish)
  );

  const headingRank = `h${largestRanking}`;

  // group the children by steps of the largest ranking. the content following the heading will be grouped as children of that step:
  const children: Hast.MdxJsxElement[] = [];

  let currentStep: Hast.MdxJsxElement | Hast.Element | undefined;
  let currentStepChildren: Hast.ElementContent[] = [];

  function resetCurrentStep() {
    if (currentStep != null) {
      const step = createStep(currentStep);
      step.children = currentStepChildren;

      // add the step to the children of the new step group component
      children.push(step);

      // reset the current step children
      currentStepChildren = [];
    }
    currentStep = undefined;
  }

  for (const child of node.children) {
    if (
      (isHastElement(child) && child.tagName === headingRank) ||
      (isMdxJsxElementHast(child) &&
        child.name?.toLocaleLowerCase() === headingRank)
    ) {
      resetCurrentStep();
      currentStep = child;
    } else {
      if (currentStep == null) {
        currentStep = {
          type: "mdxJsxFlowElement" as const,
          name: "Step",
          children: [],
          attributes: [],
        };
      }

      currentStepChildren.push(child);
    }
  }

  resetCurrentStep();

  node.children = children;
}

function getAttributes(
  node: Hast.MdxJsxElement | Hast.Element
): (MdxJsxAttribute | MdxJsxExpressionAttribute)[] {
  if (node.type === "element") {
    return Object.entries(node.properties).map(([key, value]) =>
      unknownToMdxJsxAttribute(key, value)
    );
  }
  return [...node.attributes];
}

function createStep(
  title: Hast.MdxJsxElement | Hast.Element
): Hast.MdxJsxElement {
  const attributes = getAttributes(title);
  if (
    !attributes.some(
      (attribute) =>
        attribute.type === "mdxJsxAttribute" && attribute.name === "title"
    )
  ) {
    let titleAttribute: MdxJsxAttribute = {
      type: "mdxJsxAttribute",
      name: "title",
    };
    attributes.push(titleAttribute);

    if (
      title.type === "element" &&
      title.children.length === 1 &&
      title.children[0] &&
      title.children[0].type === "text"
    ) {
      titleAttribute.value = title.children[0].value;
    } else {
      const estree = toEstree(
        title.children.length === 1 && title.children[0]
          ? title.children[0]
          : {
              type: "mdxJsxTextElement",
              children: title.children,
              name: null,
              attributes: [],
            }
      );
      titleAttribute.value = {
        type: "mdxJsxAttributeValueExpression",
        value: toJs(estree, { handlers: jsx }).value.trim().replace(/;$/, ""),
        data: { estree },
      };
    }
  }

  return {
    type: "mdxJsxFlowElement" as const,
    name: "Step",
    children: [],
    attributes,
  };
}
