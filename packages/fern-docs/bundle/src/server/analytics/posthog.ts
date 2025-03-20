import "server-only";

import { after } from "next/server";

import { PostHog } from "posthog-node";

function getPosthogKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
  if (key == null) {
    return undefined;
  }
  return key.trim();
}

function getPosthog(): PostHog | undefined {
  const key = getPosthogKey();
  if (!key) {
    return undefined;
  }
  return new PostHog(key, {
    host: "https://us.i.posthog.com",
  });
}

export function track(event: string, properties?: Record<string, unknown>) {
  after(async () => {
    try {
      const client = getPosthog();

      client?.capture({
        event,
        distinctId: "server-side-event",
        properties: {
          // anonymize this event because it's server-side https://posthog.com/docs/product-analytics/capture-events?tab=Backend
          $process_person_profile: false,
          ...properties,
        },
      });

      await client?.shutdown();
    } catch (error) {
      if (process.env.NODE_ENV !== "development") {
        console.error(error);
      }
    }
  });
}
