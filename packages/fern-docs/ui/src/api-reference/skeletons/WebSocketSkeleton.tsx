import { WithAside } from "../../contexts/api-page";
// import { WebSocketContent } from "../websockets/WebSocketContent";

// const SKELETON_BREADCRUMB = [
//   { title: "API Reference", pointsTo: undefined },
//   { title: "WebSockets", pointsTo: undefined },
//   { title: "Loading...", pointsTo: undefined },
// ];

// const SKELETON_CONTEXT = {
//   node: {
//     id: "loading-websocket",
//     type: "websocket" as const,
//     name: "Loading WebSocket",
//     slug: "loading-websocket",
//     path: "/ws/loading",
//     sdkRequest: {
//       name: "loading",
//       shape: { type: "primitive" as const, primitive: "string" as const },
//     },
//   },
//   websocket: {
//     name: "LoadingWebSocket",
//     path: "/ws/loading",
//     messages: [
//       {
//         type: "incoming" as const,
//         name: "LoadingMessage",
//         shape: {
//           type: "primitive" as const,
//           primitive: "string" as const,
//         },
//       },
//     ],
//     examples: [
//       {
//         name: "Default",
//         messages: [
//           {
//             direction: "incoming" as const,
//             content: {
//               type: "json" as const,
//               value: { message: "Loading WebSocket data..." },
//             },
//           },
//         ],
//         code: "// Loading WebSocket example...",
//       },
//     ],
//   },
// };

export const WebSocketSkeleton = () => {
  return (
    <WithAside.Provider value={true}>
      <p>Loading...</p>
    </WithAside.Provider>
  );
};
