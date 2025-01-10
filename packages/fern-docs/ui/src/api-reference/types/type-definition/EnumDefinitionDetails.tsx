import { cn, Empty } from "@fern-docs/components";
import { composeRefs } from "@radix-ui/react-compose-refs";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const EnumDefinitionDetails = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    children: ReactElement<{ children: string; description?: string }>[];
    searchInput?: string;
  }
>(({ children, searchInput = "", ...props }, forwardedRef) => {
  const ref = useRef<HTMLDivElement>(null);
  const filteredChildren = children.filter(
    (element) =>
      element.props.children
        .toLowerCase()
        .includes(searchInput.toLowerCase()) ||
      element.props?.description
        ?.toLowerCase()
        .includes(searchInput.toLowerCase())
  );

  useIsomorphicLayoutEffect(() => {
    if (ref.current) {
      const treeWalker = document.createTreeWalker(
        ref.current,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            if (
              node.nodeValue?.toLowerCase().includes(searchInput.toLowerCase())
            ) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          },
        }
      );

      let currentNode;
      const highlight = new Highlight();
      while ((currentNode = treeWalker.nextNode())) {
        const parentElement = currentNode.parentElement;
        if (parentElement) {
          const range = document.createRange();
          const startOffset = currentNode.nodeValue
            ?.toLowerCase()
            .indexOf(searchInput.toLowerCase());
          if (startOffset !== -1 && startOffset !== undefined) {
            range.setStart(currentNode, startOffset);
            range.setEnd(currentNode, startOffset + searchInput.length);
            highlight.add(range);
          }
        }
      }
      CSS.highlights.set("mark", highlight);
    }
  }, [searchInput]);

  // use 140px to decapitate overflowing enum values and indicate scrollability
  return (
    <div
      {...props}
      className={cn("max-h-[140px] overflow-y-auto", props.className)}
      ref={composeRefs(forwardedRef, ref)}
    >
      {filteredChildren.length > 0 ? (
        <div className="flex flex-wrap gap-2">{filteredChildren}</div>
      ) : (
        <Empty name="No results" description="No enum values found" />
      )}
    </div>
  );
});

EnumDefinitionDetails.displayName = "EnumDefinitionDetails";
