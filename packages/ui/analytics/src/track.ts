const TRACK_EVENT_NAME = "fern-docs-track-analytics";

/**
 * Track an event.
 *
 * @param event - The event name.
 * @param properties - The event properties.
 */
export function track(event: string, properties?: Record<string, unknown>): void {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new CustomEvent(TRACK_EVENT_NAME, { detail: { event, properties } }));
}

/**
 * Track an event that is only for internal use.
 *
 * @param event - The event name.
 * @param properties - The event properties.
 */
export function trackInternal(event: string, properties?: Record<string, unknown>): void {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new CustomEvent(TRACK_EVENT_NAME, { detail: { event, properties, internal: true } }));
}
