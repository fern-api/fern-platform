import { PLATFORM } from "@fern-api/ui-core-utils";
import { useEventCallback, useKeyboardCommand, useKeyboardPress } from "@fern-ui/react-commons";

export function useSearchTrigger(setOpen: (open: boolean) => void): void {
    useKeyboardPress({
        key: "Slash",
        onPress: useEventCallback(() => {
            const activeElement = document.activeElement;
            const activeElementTag = activeElement?.tagName.toLowerCase();
            const isInkeep = activeElement?.id.includes("inkeep");
            if (
                !isInkeep &&
                activeElementTag !== "input" &&
                activeElementTag !== "textarea" &&
                activeElementTag !== "select"
            ) {
                setOpen(true);
            }
        }),
    });

    // fallback (old behavior)
    useKeyboardCommand({ key: "K", platform: PLATFORM, onCommand: useEventCallback(() => setOpen(true)) });
}
