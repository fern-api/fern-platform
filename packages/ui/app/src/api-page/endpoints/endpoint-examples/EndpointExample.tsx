// import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
// import { useCallback, useMemo } from "react";
// import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
// import { CurlExample } from "../../examples/curl-example/CurlExample";
// import { getCurlLines } from "../../examples/curl-example/curlUtils";
// import { JsonExampleVirtualized } from "../../examples/json-example/JsonExample";
// import { flattenJsonToLines } from "../../examples/json-example/jsonLineUtils";
// import { TitledExample } from "../../examples/TitledExample";
// import { useEndpointContext } from "../endpoint-context/useEndpointContext";

// export declare namespace EndpointExample {
//     export interface Props {
//         endpoint: FernRegistryApiRead.EndpointDefinition;
//         example: FernRegistryApiRead.ExampleEndpointCall;
//     }
// }

// const GAP_6 = 24;
// const HEADER_HEIGHT = 63;
// const TITLED_EXAMPLE_PADDING = 43;
// const PADDING_TOP = 32;
// const PADDING_BOTTOM = 40;
// const LINE_HEIGHT = 21.5;

// export const EndpointExample: React.FC<EndpointExample.Props> = ({ endpoint, example }) => {
//     const { apiDefinition } = useApiDefinitionContext();
//     const { hoveredRequestPropertyPath, hoveredResponsePropertyPath } = useEndpointContext();

//     const curlLines = useMemo(
//         () => getCurlLines(apiDefinition, endpoint, example, flattenJsonToLines(example.requestBody)),
//         [apiDefinition, endpoint, example]
//     );
//     const jsonLines = useMemo(() => flattenJsonToLines(example.responseBody), [example.responseBody]);

//     const calculateEndpointHeights = useCallback(() => {
//         if (window == null) {
//             return [0, 0];
//         }
//         const containerHeight = window.innerHeight - HEADER_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
//         const requestContentHeight = curlLines.length * LINE_HEIGHT + 40 + TITLED_EXAMPLE_PADDING;
//         const responseContentHeight = jsonLines.length * LINE_HEIGHT + 40 + TITLED_EXAMPLE_PADDING;
//         const halfContainerHeight = (containerHeight - GAP_6) / 2;
//         if (example.responseBody == null) {
//             return [Math.min(requestContentHeight, containerHeight), 0];
//         }
//         if (requestContentHeight >= halfContainerHeight && responseContentHeight >= halfContainerHeight) {
//             return [halfContainerHeight, halfContainerHeight];
//         } else if (requestContentHeight + responseContentHeight <= containerHeight - GAP_6) {
//             return [requestContentHeight, responseContentHeight];
//         } else if (requestContentHeight < halfContainerHeight) {
//             const remainingContainerHeight = containerHeight - requestContentHeight - GAP_6;
//             return [requestContentHeight, Math.min(remainingContainerHeight, responseContentHeight)];
//         } else if (responseContentHeight < halfContainerHeight) {
//             const remainingContainerHeight = containerHeight - responseContentHeight - GAP_6;
//             return [Math.min(remainingContainerHeight, requestContentHeight), responseContentHeight];
//         } else {
//             return [0, 0];
//         }
//     }, [curlLines.length, example.responseBody, jsonLines.length]);

//     return (
//         <div className="flex min-h-0 flex-1 flex-col">
//             <div className="grid min-h-0 flex-1 flex-col gap-6">
//                 <TitledExample
//                     title="Request"
//                     type="primary"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                     }}
//                     disablePadding={true}
//                 >
//                     <CurlExample
//                         curlLines={curlLines}
//                         selectedProperty={hoveredRequestPropertyPath}
//                         height={requestMaxHeight - TITLED_EXAMPLE_PADDING}
//                     />
//                 </TitledExample>
//                 {example.responseBody != null && (
//                     <TitledExample
//                         title={example.responseStatusCode >= 400 ? "Error Response" : "Response"}
//                         type={example.responseStatusCode >= 400 ? "warning" : "primary"}
//                         onClick={(e) => {
//                             e.stopPropagation();
//                         }}
//                         copyToClipboardText={() => JSON.stringify(example.responseBody, undefined, 2)}
//                         disablePadding={true}
//                     >
//                         <JsonExampleVirtualized
//                             jsonLines={jsonLines}
//                             selectedProperty={hoveredResponsePropertyPath}
//                             height={responseMaxHeight - TITLED_EXAMPLE_PADDING}
//                         />
//                     </TitledExample>
//                 )}
//             </div>
//         </div>
//     );
// };
