import { assertNever } from "@fern-api/ui-core-utils";
import { useCallback, useReducer } from "react";

export declare namespace useIsHovering {
  export interface Return {
    isHovering: boolean;
    onMouseOver: () => void;
    onMouseLeave: () => void;
    onMouseMove: () => void;
    onMouseEnter: () => void;
  }
}

export function useIsHovering(): useIsHovering.Return {
  const [state, dispatch] = useReducer(
    (
      previousState: "inside" | "outside" | "hovering",
      action: "mouseover" | "mouseleave" | "mousemove" | "mouseenter"
    ) => {
      switch (action) {
        case "mouseover":
          return previousState === "hovering" ? "hovering" : "inside";
        case "mouseleave":
          return "outside";
        case "mousemove":
          return previousState === "inside" ? "hovering" : previousState;
        case "mouseenter":
          return "hovering";
        default:
          assertNever(action);
      }
    },
    "outside"
  );

  return {
    isHovering: state === "hovering",
    onMouseOver: useCallback(() => dispatch("mouseover"), []),
    onMouseLeave: useCallback(() => dispatch("mouseleave"), []),
    onMouseMove: useCallback(() => dispatch("mousemove"), []),
    onMouseEnter: useCallback(() => dispatch("mouseenter"), []),
  };
}
