import { EndpointDefinition } from "@fern-api/fdr-sdk/api-definition";

export function useFindEndpoint(
  _method: string,
  _path: string,
  _example: string | undefined
): EndpointDefinition | undefined {
  // return useAtomValue(
  //   useMemoOne(
  //     () =>
  //       atom((get) => {
  //         let endpoint: EndpointDefinition | undefined;
  //         for (const apiDefinition of Object.values(get(READ_APIS_ATOM))) {
  //           endpoint = findEndpoint({
  //             apiDefinition,
  //             path,
  //             method,
  //             example,
  //           });
  //           if (endpoint) {
  //             break;
  //           }
  //         }
  //         return endpoint;
  //       }),
  //     [example, method, path]
  //   )
  // );
  return undefined;
}
