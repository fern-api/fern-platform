import { WithAside } from "../../contexts/api-page";
// import { WebhookContent } from "../webhooks/WebhookContent";

// const SKELETON_BREADCRUMB = [
//   {
//     title: "API Reference",
//     pointsTo: undefined,
//   },
//   {
//     title: "Webhooks",
//     pointsTo: undefined,
//   },
//   {
//     title: "Loading...",
//     pointsTo: undefined,
//   },
// ];

// const SKELETON_CONTEXT = {
//   node: {
//     id: "loading-webhook",
//     type: "webhook" as const,
//     name: "Loading Webhook",
//     slug: "loading-webhook",
//     sdkRequest: {
//       name: "loading",
//       shape: { type: "primitive" as const, primitive: "string" as const },
//     },
//   },
//   webhook: {
//     name: "LoadingWebhook",
//     examples: [
//       {
//         name: "Default",
//         exampleCall: {
//           requestBody: {
//             type: "json" as const,
//             value: { event: "webhook.loading" },
//           },
//           responseStatusCode: 200,
//           responseBody: null,
//         },
//         code: "// Loading webhook example...",
//       },
//     ],
//     request: {
//       name: "LoadingWebhookRequest",
//       shape: { type: "primitive" as const, primitive: "string" as const },
//     },
//   },
// };

export const WebhookSkeleton = () => {
  return (
    <WithAside.Provider value={true}>
      <p>Loading...</p>
    </WithAside.Provider>
  );
};
