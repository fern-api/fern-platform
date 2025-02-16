import { toEstree } from "hast-util-to-estree";

import { isNonNullish } from "@fern-api/ui-core-utils";
import {
  CONTINUE,
  Hast,
  SKIP,
  Unified,
  hastMdxJsxElementHastToProps,
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

export const rehypeTabs: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node, index, parent) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Tabs") {
        node.name = "TabGroup";
      }

      if (node.name === "Tab" && parent != null && index != null) {
        // ensure the parent component is a TabGroup
        if (isMdxJsxElementHast(parent) && parent.name === "TabGroup") {
          return CONTINUE;
        }

        const tabGroup = {
          type: "mdxJsxFlowElement" as const,
          name: "TabGroup",
          children: [node],
          attributes: [],
        };

        parent.children[index] = tabGroup;
        return [SKIP, index];
      }

      return CONTINUE;
    });
  };
};

export const rehypeAccordions: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node, index, parent) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Accordions") {
        node.name = "AccordionGroup";
      }

      if (node.name === "Accordion" && parent != null && index != null) {
        // ensure the parent component is an AccordionGroup
        if (isMdxJsxElementHast(parent) && parent.name === "AccordionGroup") {
          return CONTINUE;
        }

        const accordionGroup = {
          type: "mdxJsxFlowElement" as const,
          name: "AccordionGroup",
          children: [node],
          attributes: [],
        };

        parent.children[index] = accordionGroup;
        return [SKIP, index];
      }

      return CONTINUE;
    });
  };
};

export const rehypeCards: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Cards") {
        node.name = "CardGroup";
      }

      return CONTINUE;
    });
  };
};

export const rehypeButtons: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Buttons") {
        node.name = "ButtonGroup";
      }

      return CONTINUE;
    });
  };
};

/**
 * The code below copies the `example` prop of an
 * `EndpointRequestSnippet` to the next `EndpointResponseSnippet` in the
 * tree. For this behavior to take effect, the following conditions
 * must be met:
 *
 * - The `EndpointResponseSnippet` must not have an `example` prop.
 * - The `EndpointResponseSnippet` must have the same `path` and
 * `method` props as the `EndpointRequestSnippet`.
 */
export const rehypeEndpointSnippets: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    let request: { path: string; method: string; example: string } | undefined;

    visit(ast, (node) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      const isRequestSnippet = node.name === "EndpointRequestSnippet";
      const isResponseSnippet = node.name === "EndpointResponseSnippet";

      // check that the current node is a request or response snippet
      if (isRequestSnippet || isResponseSnippet) {
        const { props } = hastMdxJsxElementHastToProps(node);

        if (isRequestSnippet) {
          if (
            typeof props.path === "string" &&
            typeof props.method === "string" &&
            typeof props.example === "string"
          ) {
            // if the request snippet contains all of the
            // required props, record them and continue to the
            // next node
            request = {
              path: props.path,
              method: props.method,
              example: props.example,
            };

            // this avoids the request reference from being
            // reset to undefined at the end of this iteration
            return SKIP;
          }
        } else if (
          !props.example &&
          request &&
          request.path === props.path &&
          request.method === props.method
        ) {
          // if the response snippet meets the conditions, copy
          // the example prop from the request snippet
          node.attributes.push(
            unknownToMdxJsxAttribute("example", request.example)
          );
        }

        // reset the request reference in all cases (except when the
        // request snippet props are being recorded)
        request = undefined;
        return SKIP;
      }

      return CONTINUE;
    });
  };
};
