import { ApiDefinition } from "@fern-api/fdr-sdk";
import { measureBytes, truncateToBytes } from "@fern-api/ui-core-utils";
import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { toDescription } from "../../utils/to-description";
import { ApiReferenceRecord, EndpointBaseRecord } from "../types";

interface CreateApiReferenceRecordWebhookOptions {
  endpointBase: EndpointBaseRecord;
  endpoint: ApiDefinition.WebhookDefinition;
}

export function createApiReferenceRecordWebhook({
  endpointBase,
  endpoint,
}: CreateApiReferenceRecordWebhookOptions): ApiReferenceRecord[] {
  const base: ApiReferenceRecord = {
    ...endpointBase,
    type: "api-reference",
  };

  const records: ApiReferenceRecord[] = [base];

  const {
    content: payload_description,
    code_snippets: payload_description_code_snippets,
  } = maybePrepareMdxContent(
    toDescription(endpoint.payloads?.[0]?.description)
  );

  const code_snippets = payload_description_code_snippets?.filter(
    (codeSnippet) => measureBytes(codeSnippet.code) < 2000
  );

  if (payload_description != null || code_snippets?.length) {
    records.push({
      ...base,
      breadcrumb: [
        ...(base.breadcrumb ?? []),
        { title: base.title, pathname: base.pathname },
      ],
      title: `${base.title} - Payload`,
      objectID: `${base.objectID}-payload`,
      hash: "#payload",
      description:
        payload_description != null
          ? truncateToBytes(payload_description, 50 * 1000)
          : undefined,
      code_snippets: code_snippets?.length ? code_snippets : undefined,
      page_position: 1,
    });
  }

  return records;
}
