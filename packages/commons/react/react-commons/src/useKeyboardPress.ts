import { type Digit, type UppercaseLetter } from "@fern-ui/core-utils";
import { useEffect } from "react";

type Arrow = "Up" | "Down" | "Right" | "Left";

export declare namespace useKeyboardPress {
    export interface Args {
        key: UppercaseLetter | Digit | Arrow;
        onPress: () => void | Promise<void>;
        preventDefault?: boolean;
    }

    export type Return = void;
}

function isUppercaseLetter(key: unknown): key is UppercaseLetter {
    return typeof key === "string" && key.length === 1 && key.charCodeAt(0) >= 65 && key.charCodeAt(0) <= 90;
}

function isArrow(key: unknown): key is Arrow {
    return typeof key === "string" && ["Up", "Down", "Right", "Left"].includes(key);
}

export function useKeyboardPress(args: useKeyboardPress.Args): void {
    const { key, onPress, preventDefault = false } = args;

    useEffect(() => {
        async function handleSaveKeyPress(e: KeyboardEvent) {
            const doKeysMatch =
                e.code === (isUppercaseLetter(key) ? `Key${key}` : isArrow(key) ? `Arrow${key}` : `Digit${key}`);
            if (doKeysMatch) {
                if (preventDefault) {
                    e.preventDefault();
                }
                await onPress();
            }
        }

        document.addEventListener("keydown", handleSaveKeyPress, false);

        return () => {
            document.removeEventListener("keydown", handleSaveKeyPress, false);
        };
    }, [key, onPress, preventDefault]);
}
