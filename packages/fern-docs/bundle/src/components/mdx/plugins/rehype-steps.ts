import { toEstree } from "hast-util-to-estree";

import { isNonNullish } from "@fern-api/ui-core-utils";
import {
  CONTINUE,
  Hast,
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
      const step: Hast.MdxJsxElement = {
        type: "mdxJsxFlowElement" as const,
        name: "Step",
        children: currentStepChildren,
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "title",
            value: {
              type: "mdxJsxAttributeValueExpression",
              value: "",
              data: {
                estree: toEstree({
                  type: "mdxJsxFlowElement",
                  name: null,
                  attributes: [],
                  children: currentStep.children,
                }),
              },
            },
          },
        ],
      };

      // copy the attributes from the current step
      if (currentStep.type === "element") {
        Object.entries(currentStep.properties).forEach(([key, value]) => {
          step.attributes.push(unknownToMdxJsxAttribute(key, value));
        });
      } else if (isMdxJsxElementHast(currentStep)) {
        step.attributes.push(...currentStep.attributes);
      }

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
      (isMdxJsxElementHast(child) && child.name === "Step")
    ) {
      resetCurrentStep();
    } else {
      currentStepChildren.push(child);
    }
  }

  resetCurrentStep();

  node.children = children;
}
