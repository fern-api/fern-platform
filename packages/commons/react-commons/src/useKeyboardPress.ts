import { useEffect } from "react";

import { type Digit, type UppercaseLetter } from "@fern-api/ui-core-utils";

type Arrow = "Up" | "Down" | "Right" | "Left";

type OtherKey =
  | "Enter"
  | "Escape"
  | "Slash"
  | "Backspace"
  | "Tab"
  | "Space"
  | "Delete";

export declare namespace useKeyboardPress {
  export interface Args {
    key: UppercaseLetter | Digit | Arrow | OtherKey;
    onPress: (e: KeyboardEvent) => void | Promise<void>;
    preventDefault?: boolean;
    capture?: boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  export type Return = void;
}

function isUppercaseLetter(key: unknown): key is UppercaseLetter {
  return (
    typeof key === "string" &&
    key.length === 1 &&
    key.charCodeAt(0) >= 65 &&
    key.charCodeAt(0) <= 90
  );
}

function isArrow(key: unknown): key is Arrow {
  return (
    typeof key === "string" && ["Up", "Down", "Right", "Left"].includes(key)
  );
}

function isDigit(key: unknown): key is Digit {
  return (
    typeof key === "number" && Number.isInteger(key) && key >= 0 && key <= 9
  );
}

export function useKeyboardPress(args: useKeyboardPress.Args): void {
  const { key, onPress, preventDefault = false, capture } = args;

  useEffect(() => {
    async function handleSaveKeyPress(e: KeyboardEvent) {
      const doKeysMatch =
        e.code ===
        (isUppercaseLetter(key)
          ? `Key${key}`
          : isArrow(key)
            ? `Arrow${key}`
            : isDigit(key)
              ? `Digit${key}`
              : key);
      if (doKeysMatch) {
        if (preventDefault) {
          e.preventDefault();
        }
        await onPress(e);
      }
    }

    document.addEventListener("keydown", handleSaveKeyPress, capture);

    return () => {
      document.removeEventListener("keydown", handleSaveKeyPress, capture);
    };
  }, [capture, key, onPress, preventDefault]);
}
