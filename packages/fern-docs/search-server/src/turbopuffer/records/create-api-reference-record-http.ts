import { ApiDefinition } from "@fern-api/fdr-sdk";
import { truncateToBytes } from "@fern-api/ui-core-utils";
import { createHash } from "crypto";
import { flatten } from "es-toolkit/array";
import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { toDescription } from "../../utils/to-description";
import { FernTurbopufferRecord } from "../types";

interface CreateApiReferenceRecordHttpOptions {
  endpointBase: FernTurbopufferRecord;
  endpoint: ApiDefinition.EndpointDefinition;
}

export function createApiReferenceRecordHttp({
  endpointBase,
  endpoint,
}: CreateApiReferenceRecordHttpOptions): FernTurbopufferRecord[] {
  const base: FernTurbopufferRecord = {
    ...endpointBase,
    attributes: {
      ...endpointBase.attributes,
      type: "api-reference",
    },
  };

  const records: FernTurbopufferRecord[] = [base];
  const {
    content: request_description,
    code_snippets: request_description_code_snippets,
  } = maybePrepareMdxContent(
    toDescription(endpoint.requests?.[0]?.description)
  );

  const code_snippets: string[] | undefined = flatten(
    request_description_code_snippets
      ? request_description_code_snippets.map((codeSnippet) => {
          const output: string[] = [];
          if (codeSnippet.code) {
            output.push(codeSnippet.code);
          }
          if (codeSnippet.lang) {
            output.push(codeSnippet.lang);
          }
          if (codeSnippet.meta) {
            output.push(codeSnippet.meta);
          }
          return output;
        })
      : []
  );

  if (
    request_description != null ||
    request_description_code_snippets?.length
  ) {
    records.push({
      ...base,
      id: createHash("sha256")
        .update(base.id + request_description)
        .digest("hex"),
      attributes: {
        ...base.attributes,
        hash: "#request",
        breadcrumb: [
          ...(base.attributes.breadcrumb ?? []),
          base.attributes.title,
          base.attributes.pathname,
        ],
        title: `${base.attributes.title} - Request`,
        // TODO: chunk this
        description:
          request_description != null
            ? truncateToBytes(request_description, 50 * 1000)
            : undefined,
        code_snippets,
        page_position: 1,
      },
    });
  }

  const {
    content: response_description,
    code_snippets: response_description_code_snippets,
  } = maybePrepareMdxContent(
    toDescription(endpoint.responses?.[0]?.description)
  );

  if (
    response_description != null ||
    response_description_code_snippets?.length
  ) {
    records.push({
      ...base,
      id: createHash("sha256")
        .update(base.id + response_description)
        .digest("hex"),
      attributes: {
        ...base.attributes,
        hash: "#response",
        breadcrumb: [
          ...(base.attributes.breadcrumb ?? []),
          base.attributes.title,
          base.attributes.pathname,
        ],
        title: `${base.attributes.title} - Response`,
        // TODO: chunk this
        description:
          response_description != null
            ? truncateToBytes(response_description, 50 * 1000)
            : undefined,
        code_snippets,
        page_position: 1,
      },
    });
  }

  return records;
}
