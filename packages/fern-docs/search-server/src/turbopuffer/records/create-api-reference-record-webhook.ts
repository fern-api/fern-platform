import { ApiDefinition } from "@fern-api/fdr-sdk";
import { truncateToBytes } from "@fern-api/ui-core-utils";
import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { toDescription } from "../../utils/to-description";
import { FernTurbopufferRecord } from "../types";
import { flatten } from "es-toolkit/array";

interface CreateApiReferenceRecordWebhookOptions {
  endpointBase: FernTurbopufferRecord;
  endpoint: ApiDefinition.WebhookDefinition;
}

export function createApiReferenceRecordWebhook({
  endpointBase,
  endpoint,
}: CreateApiReferenceRecordWebhookOptions): FernTurbopufferRecord[] {
  const base: FernTurbopufferRecord = {
    ...endpointBase,
    attributes: {
      ...endpointBase.attributes,
      type: "api-reference",
    },
  };

  const records: FernTurbopufferRecord[] = [base];

  const {
    content: payload_description,
    code_snippets: payload_description_code_snippets,
  } = maybePrepareMdxContent(
    toDescription(endpoint.payloads?.[0]?.description)
  );

  const code_snippets: (string[] | undefined) = flatten(
    payload_description_code_snippets ? payload_description_code_snippets.map((codeSnippet) => {
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
    }) : []
  );

  if (payload_description != null || code_snippets?.length) {
    records.push({
      ...base,
      attributes: {
        ...base.attributes,
        breadcrumb: [
          ...(base.attributes.breadcrumb ?? []),
          base.attributes.title,
          base.attributes.pathname,
        ],
        title: `${base.attributes.title} - Payload`,
        hash: "#payload",
        description:
            payload_description != null
            ? truncateToBytes(payload_description, 50 * 1000)
            : undefined,
        code_snippets: code_snippets?.length ? code_snippets : undefined,
        page_position: 1,
      },
    });
  }

  return records;
}
