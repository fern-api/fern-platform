import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { useCallbackOne } from "use-memo-one";
import { FERN_STREAM_ATOM, SLUG_ATOM, useAtomEffect } from "../../atoms";
import { Endpoint } from "./Endpoint";
import { EndpointStreamingEnabledToggle } from "./EndpointStreamingEnabledToggle";

interface EndpointPairProps {
  showErrors: boolean;
  node: FernNavigation.EndpointPairNode;
  apiDefinition: ApiDefinition;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  last?: boolean;
}

export function EndpointPair({
  showErrors,
  node,
  apiDefinition,
  breadcrumb,
  last,
}: EndpointPairProps): ReactElement {
  const isStream = useAtomValue(FERN_STREAM_ATOM);

  useAtomEffect(
    useCallbackOne(
      (get, set) => {
        const slug = get(SLUG_ATOM);
        if (node.nonStream.slug === slug) {
          set(FERN_STREAM_ATOM, false);
        } else if (node.stream.slug === slug) {
          set(FERN_STREAM_ATOM, true);
        }
      },
      [node.nonStream.slug, node.stream.slug]
    )
  );

  const endpointNode = isStream ? node.stream : node.nonStream;

  return (
    <Endpoint
      breadcrumb={breadcrumb}
      showErrors={showErrors}
      node={endpointNode}
      apiDefinition={apiDefinition}
      streamToggle={<EndpointStreamingEnabledToggle node={node} />}
      last={last}
    />
  );
}
