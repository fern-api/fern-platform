import { useCallback, useReducer } from "react";

import { assertNever } from "@fern-api/ui-core-utils";

export declare namespace useIsHovering {
  export interface Return {
    isHovering: boolean;
    onPointerOver: () => void;
    onPointerLeave: () => void;
    onPointerMove: () => void;
    onPointerEnter: () => void;
  }
}

export function useIsHovering(): useIsHovering.Return {
  const [state, dispatch] = useReducer(
    (
      previousState: "inside" | "outside" | "hovering",
      action: "pointerover" | "pointerleave" | "pointermove" | "pointerenter"
    ) => {
      switch (action) {
        case "pointerover":
          return previousState === "hovering" ? "hovering" : "inside";
        case "pointerleave":
          return "outside";
        case "pointermove":
          return previousState === "inside" ? "hovering" : previousState;
        case "pointerenter":
          return "hovering";
        default:
          assertNever(action);
      }
    },
    "outside"
  );

  return {
    isHovering: state === "hovering",
    onPointerOver: useCallback(() => dispatch("pointerover"), []),
    onPointerLeave: useCallback(() => dispatch("pointerleave"), []),
    onPointerMove: useCallback(() => dispatch("pointermove"), []),
    onPointerEnter: useCallback(() => dispatch("pointerenter"), []),
  };
}
