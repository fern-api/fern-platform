// import { usePathname } from "next/navigation";
// import { ReactElement } from "react";

// import { useAtomValue } from "jotai";
// import { useCallbackOne } from "use-memo-one";

// import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
// import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
// import { slugjoin } from "@fern-api/fdr-sdk/navigation";

// import { FERN_STREAM_ATOM, useAtomEffect } from "../../atoms";
// import { Endpoint } from "./Endpoint";
// import { EndpointStreamingEnabledToggle } from "./EndpointStreamingEnabledToggle";

// interface EndpointPairProps {
//   showErrors: boolean;
//   node: FernNavigation.EndpointPairNode;
//   apiDefinition: ApiDefinition;
//   breadcrumb: readonly FernNavigation.BreadcrumbItem[];
// }

// export function EndpointPair({
//   showErrors,
//   node,
//   apiDefinition,
//   breadcrumb,
// }: EndpointPairProps): ReactElement<any> {
//   const isStream = useAtomValue(FERN_STREAM_ATOM);
//   const slug = slugjoin(usePathname());

//   useAtomEffect(
//     useCallbackOne(
//       (_, set) => {
//         if (node.nonStream.slug === slug) {
//           set(FERN_STREAM_ATOM, false);
//         } else if (node.stream.slug === slug) {
//           set(FERN_STREAM_ATOM, true);
//         }
//       },
//       [node.nonStream.slug, node.stream.slug, slug]
//     )
//   );

//   const endpointNode = isStream ? node.stream : node.nonStream;

//   return (
//     <Endpoint
//       breadcrumb={breadcrumb}
//       showErrors={showErrors}
//       node={endpointNode}
//       apiDefinition={apiDefinition}
//       streamToggle={<EndpointStreamingEnabledToggle node={node} />}
//     />
//   );
// }
