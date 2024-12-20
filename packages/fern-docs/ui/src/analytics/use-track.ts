import React from "react";
import { z } from "zod";

const TRACK_EVENT_NAME = "fern-docs-track-analytics";
const TrackEventSchema = z.object({
  event: z.string(),
  properties: z
    .record(
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.string().array().readonly(),
        z.number().array().readonly(),
        z.boolean().array().readonly(),
        z.undefined(),
      ])
    )
    .optional(),
  internal: z.boolean().optional(),
});

type TrackEvent = z.infer<typeof TrackEventSchema>;

/**
 * Listen for track events, and emit them to analytics integrations.
 *
 * @param cb - The callback to emit the event to.
 * @param allowInternal - Whether to allow internal events to be emitted. Defaults to false. Only use this for Fern's internal posthog instance.
 */
export function useSafeListenTrackEvents(
  cb: (detail: TrackEvent) => void,
  allowInternal = false
): void {
  const ref = React.useRef<(detail: TrackEvent) => void>(cb);

  React.useEffect(() => {
    ref.current = cb;
  });

  React.useEffect(() => {
    const handler = (event: Event) => {
      try {
        if (event instanceof CustomEvent) {
          const detail = TrackEventSchema.safeParse(event.detail);
          if (detail.success && (allowInternal || !detail.data.internal)) {
            ref.current(detail.data);
          }
        }
      } catch (error) {
         
        console.warn("Error emitting track event", error, event);
      }
    };
    window.addEventListener(TRACK_EVENT_NAME, handler);
    return () => window.removeEventListener(TRACK_EVENT_NAME, handler);
  }, [allowInternal]);
}
