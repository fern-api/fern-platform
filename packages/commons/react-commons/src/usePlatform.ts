import { getPlatform, type Platform } from "@fern-api/ui-core-utils";
import { useEffect, useState } from "react";

// this is updated by the browser
let globalPlatform: Platform | undefined;

/**
 * Returns the platform that the app is running on.
 *
 * This is useful for conditional rendering of platform-specific components.
 */
export function usePlatform(): Platform | undefined {
    const [platform, setPlatform] = useState(() => globalPlatform);

    // upon mount, update the global platform
    useEffect(() => {
        globalPlatform = getPlatform();
        setPlatform(getPlatform());
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
