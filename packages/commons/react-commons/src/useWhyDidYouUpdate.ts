import { useEffect, useRef } from "react";

export function useWhyDidYouUpdate(
    name: string,
    props: Record<string, unknown>
): void {
    // Get a mutable ref object where we can store props ...
    // ... for comparison next time this hook runs.
    const previousProps = useRef<Record<string, unknown>>();

    useEffect(() => {
        const prev = previousProps.current;
        if (prev != null) {
            // Get all keys from previous and current props
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            // Use this object to keep track of changed props
            const changesObj: Record<string, unknown> = {};
            // Iterate through keys
            allKeys.forEach((key: string) => {
                // If previous is different from current
                if (prev[key] !== props[key]) {
                    // Add to changesObj
                    changesObj[key] = {
                        from: prev[key],
                        to: props[key],
                    };
                }
            });

            // If changesObj not empty then output to console
            if (Object.keys(changesObj).length) {
                // eslint-disable-next-line no-console
                console.log("[why-did-you-update]", name, changesObj);
            }
        }

        // Finally update previousProps with current props for next hook call
        previousProps.current = props;
    });
}
