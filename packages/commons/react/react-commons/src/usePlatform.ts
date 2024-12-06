import { PLATFORM } from "@fern-api/ui-core-utils";
import { useEffect, useState } from "react";

// this is updated by the browser
let globalPlatform: typeof PLATFORM | undefined;

/**
 * Returns the platform that the app is running on.
 *
 * This is useful for conditional rendering of platform-specific components.
 */
export function usePlatform(): typeof PLATFORM | undefined {
    const [platform, setPlatform] = useState(() => globalPlatform);

    // upon mount, update the global platform
    useEffect(() => {
        globalPlatform = PLATFORM;
        setPlatform(PLATFORM);
    }, []);

    return platform;
}

export function usePlatformKbdShortcut(): string | undefined {
    const platform = usePlatform();
    if (platform === undefined) {
        return undefined;
    }
    return platform === "mac" ? "⌘" : "Ctrl";
}
