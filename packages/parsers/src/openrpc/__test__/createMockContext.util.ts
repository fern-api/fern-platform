import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { vi } from "vitest";
import { BaseOpenrpcConverterNodeContext } from "../BaseOpenrpcConverter.node";

export function createMockContext(
  document?: OpenrpcDocument
): BaseOpenrpcConverterNodeContext {
  return {
    document: {
      openapi: "3.1.0",
      info: {
        title: "Mock API",
        version: "1.0.0",
      },
      paths: {},
      components: document.components,
    },
    openrpc: document,
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      log: vi.fn(),
    },
    errors: {
      error: vi.fn(),
      warning: vi.fn(),
      warnings: [],
      errors: [],
    },
  };
}
