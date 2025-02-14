import { NodeId, PlaygroundSettings } from "@fern-api/fdr-sdk/navigation";

export function usePlaygroundSettings(
  _currentNodeId?: NodeId
): PlaygroundSettings | undefined {
  // const navigationNodes = useNodeCollector();

  // const nodeIdToUse = playgroundOpen ? playgroundNodeId : currentNodeId;

  // if (nodeIdToUse) {
  //   const maybeCurrentHasPlayground = nodeHasPlayground(
  //     navigationNodes.get(nodeIdToUse)
  //   );

  //   if (maybeCurrentHasPlayground) {
  //     return maybeCurrentHasPlayground;
  //   } else {
  //     for (const node of [
  //       ...navigationNodes.getParents(nodeIdToUse),
  //     ].reverse()) {
  //       const maybeNodeHasPlayground = nodeHasPlayground(node);
  //       if (maybeNodeHasPlayground) {
  //         return maybeNodeHasPlayground;
  //       }
  //     }
  //   }
  // }

  // return;
  return undefined;
}

// function nodeHasPlayground(currentNode?: NavigationNode) {
//   return (
//     currentNode &&
//     visitDiscriminatedUnion(currentNode)._visit<PlaygroundSettings | undefined>(
//       {
//         root: () => undefined,
//         product: () => undefined,
//         productgroup: () => undefined,
//         versioned: () => undefined,
//         tabbed: () => undefined,
//         sidebarRoot: () => undefined,
//         sidebarGroup: () => undefined,
//         version: () => undefined,
//         unversioned: () => undefined,
//         tab: () => undefined,
//         link: () => undefined,
//         page: () => undefined,
//         landingPage: () => undefined,
//         section: () => undefined,
//         apiReference: (node) => node.playground,
//         changelog: () => undefined,
//         changelogYear: () => undefined,
//         changelogMonth: () => undefined,
//         changelogEntry: () => undefined,
//         endpoint: (node) => node.playground,
//         endpointPair: () => undefined,
//         webSocket: (node) => node.playground,
//         webhook: () => undefined,
//         apiPackage: (node) => node.playground,
//       }
//     )
//   );
// }
