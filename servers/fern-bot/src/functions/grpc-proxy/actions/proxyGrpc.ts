import {
  GrpcProxyRequest,
  GrpcProxyResponse,
  ProtobufSchema,
} from "@generated/api";
import { Buf } from "@libs/buf";
import { fetchAndUnzip } from "@utils/fetchAndUnzip";
import { mkdir } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { DEFAULT_PROTO_DIRECTORY, DEFAULT_PROTO_SOURCE_URL } from "./constants";

interface Options {
  skipDefaultSchema?: boolean;
}

export async function proxyGrpcInternal({
  request,
  options,
}: {
  request: GrpcProxyRequest;
  options?: Options;
}): Promise<GrpcProxyResponse> {
  const buf = new Buf();
  try {
    const response = await buf.curl({
      request: await toCurlRequest({ request, options }),
    });
    return {
      body: response.body,
    };
  } catch (error) {
    console.debug("Failed to proxy gRPC request:", error);
    if (error instanceof Error) {
      return {
        body: error.message,
      };
    }
    throw error;
  }
}

async function toCurlRequest({
  request,
  options,
}: {
  request: GrpcProxyRequest;
  options?: Options;
}): Promise<Buf.CurlRequest> {
  return {
    baseUrl: request.baseUrl,
    endpoint: getGrpcPathForEndpoint(request.endpoint),
    headers: getCurlHeaders(request.headers),
    schema:
      request.schema != null
        ? await fetchProtobufSchema(request.schema)
        : !options?.skipDefaultSchema
          ? await fetchProtobufSchema({
              type: "remote",
              sourceUrl: DEFAULT_PROTO_SOURCE_URL,
            })
          : undefined,
    grpc: true,
    body: request.body,
  };
}

async function fetchProtobufSchema(schema: ProtobufSchema): Promise<string> {
  const absolutePathToProtoDirectory = path.join(
    (await tmp.dir()).path,
    DEFAULT_PROTO_DIRECTORY
  );
  console.debug(`mkdir ${absolutePathToProtoDirectory}`);
  await mkdir(absolutePathToProtoDirectory, { recursive: true });

  await fetchAndUnzip({
    destination: absolutePathToProtoDirectory,
    sourceUrl: schema.sourceUrl,
  });

  return absolutePathToProtoDirectory;
}

function getGrpcPathForEndpoint(endpoint: string): string {
  // TODO: Temporary mapping between endpoint ID and gRPC path.
  switch (endpoint) {
    case "endpoint_index.delete":
      return "VectorService/Delete";
    case "endpoint_index.describe_index_stats":
      return "VectorService/DescribeIndexStats";
    case "endpoint_index.fetch":
      return "VectorService/Fetch";
    case "endpoint_index.list":
      return "VectorService/List";
    case "endpoint_index.update":
      return "VectorService/Update";
    case "endpoint_index.upsert":
      return "VectorService/Upsert";
    case "endpoint_index.query":
      return "VectorService/Query";
    default:
      return endpoint;
  }
}

function getCurlHeaders(headers: Record<string, string>): string[] {
  return Object.entries(headers).map(([key, value]) => `${key}: ${value}`);
}
