import { useEffect } from "react";

import {
  type Digit,
  type Platform,
  type UppercaseLetter,
} from "@fern-api/ui-core-utils";

export declare namespace useKeyboardCommand {
  export interface Args {
    key: UppercaseLetter | Digit;
    platform: Platform;
    onCommand: () => void | Promise<void>;
    preventDefault?: boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  export type Return = void;
}

/**
 * Registers a callback that fires on every keyboard command. A keyboard command is a sequence of key
 * events where the first pressed key is cmd (on Mac) or ctrl (on Windows) and the second one is any
 * alphanumeric.
 */
export function useKeyboardCommand(args: useKeyboardCommand.Args): void {
  const { onCommand, key, platform, preventDefault = true } = args;

  useEffect(() => {
    async function handleSaveKeyPress(e: KeyboardEvent) {
      const isCmdCtrlPressed =
        (platform === "mac" && e.metaKey) ||
        (platform === "windows" && e.ctrlKey);
      const doKeysMatch =
        e.code === (typeof key === "string" ? `Key${key}` : `Digit${key}`);
      if (isCmdCtrlPressed && doKeysMatch) {
        if (preventDefault) {
          e.preventDefault();
        }
        await onCommand();
      }
    }

    document.addEventListener(
      "keydown",
      (e) => void handleSaveKeyPress(e),
      true
    );

    return () => {
      document.removeEventListener(
        "keydown",
        (e) => void handleSaveKeyPress(e),
        true
      );
    };
  }, [key, onCommand, platform, preventDefault]);
}
