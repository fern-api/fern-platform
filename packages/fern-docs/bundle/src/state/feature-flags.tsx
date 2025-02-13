"use client";

import type { LDContext } from "launchdarkly-react-client-sdk";

export interface LaunchDarklyInfo {
  clientSideId: string;
  contextEndpoint?: string;
  context?: LDContext;
  defaultFlags?: object;
  options:
    | {
        baseUrl?: string;
        streamUrl?: string;
        eventsUrl?: string;
        hash?: string;
      }
    | undefined;
}

export interface FeatureFlagsConfig {
  launchDarkly: LaunchDarklyInfo | undefined;
}
