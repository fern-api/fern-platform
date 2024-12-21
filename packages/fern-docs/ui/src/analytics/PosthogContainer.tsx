import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ReactElement } from "react";
import {
  capturePosthogEventCustomer,
  capturePosthogEventInternal,
  useInitializePosthog,
} from "./posthog";
import { useSafeListenTrackEvents } from "./use-track";

export function Posthog(props: {
  customerConfig?: DocsV1Read.PostHogConfig;
}): ReactElement {
  useInitializePosthog(props.customerConfig);
  useSafeListenTrackEvents(({ event, properties }) => {
    capturePosthogEventCustomer(event, properties);
  });
  useSafeListenTrackEvents(({ event, properties }) => {
    capturePosthogEventInternal(event, properties);
  }, true);
  return <></>;
}
