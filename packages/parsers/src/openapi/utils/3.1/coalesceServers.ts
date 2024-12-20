import { OpenAPIV3_1 } from "openapi-types";
import { ServerObjectConverterNode } from "../../3.1/paths/ServerObjectConverter.node";
import { BaseOpenApiV3_1ConverterNodeContext } from "../../BaseOpenApiV3_1Converter.node";

export function coalesceServers(
  existingServers: ServerObjectConverterNode[] | undefined,
  serversToAdd: OpenAPIV3_1.ServerObject[] | undefined,
  context: BaseOpenApiV3_1ConverterNodeContext,
  accessPath: string[]
): ServerObjectConverterNode[] {
  return [
    ...(existingServers ?? []),
    ...(serversToAdd ?? []).map(
      (server, index) =>
        new ServerObjectConverterNode({
          input: server,
          context,
          accessPath,
          pathId: `servers[${index}]`,
        })
    ),
  ];
}
