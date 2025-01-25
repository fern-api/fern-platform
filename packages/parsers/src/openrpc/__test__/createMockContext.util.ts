import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { OpenrpcContext } from "../OpenrpcContext";

export function createMockContext(document?: OpenrpcDocument): OpenrpcContext {
  return new OpenrpcContext({
    openrpc: document,
    logger: {
      log: console.log,
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    },
  });
}
