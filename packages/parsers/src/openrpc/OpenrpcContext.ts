import type { Logger } from "@fern-api/logger";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { OpenAPIV3_1 } from "openapi-types";
import { TypeDefinition } from "../client/generated/api/resources/api/resources/latest";
import { BaseOpenApiV3_1ConverterNodeContext } from "../openapi";

export declare namespace OpenrpcContext {
  interface Args {
    openrpc: OpenrpcDocument;
    logger: Logger;
  }
}

export class OpenrpcContext extends BaseOpenApiV3_1ConverterNodeContext {
  public openrpc: OpenrpcDocument;
  public override logger: Logger;
  public generatedTypes: Record<string, TypeDefinition>;

  constructor(args: OpenrpcContext.Args) {
    super();
    this.openrpc = args.openrpc;
    this.logger = args.logger;
    this.generatedTypes = {};
  }

  public get document(): OpenAPIV3_1.Document {
    return {
      openapi: "3.1.0",
      info: {
        title: "Mock API",
        version: "1.0.0",
      },
      paths: {},
      components: this.openrpc.components,
    };
  }
}
