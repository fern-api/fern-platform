import { ReactElement } from "react";

import { DocsV1Read } from "@fern-api/fdr-sdk";

import {
  capturePosthogEventCustomer,
  capturePosthogEventInternal,
  useInitializePosthog,
} from "./posthog";
import { useSafeListenTrackEvents } from "./use-track";

export function PosthogProvider(props: {
  customerConfig?: DocsV1Read.PostHogConfig;
}): ReactElement<any> {
  useInitializePosthog(props.customerConfig);
  useSafeListenTrackEvents(({ event, properties }) => {
    capturePosthogEventCustomer(event, properties);
  });
  useSafeListenTrackEvents(({ event, properties }) => {
    capturePosthogEventInternal(event, properties);
  }, true);
  return <></>;
}
