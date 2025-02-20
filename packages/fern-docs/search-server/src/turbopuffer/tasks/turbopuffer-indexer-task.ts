import { NavigationNodePage } from "@fern-api/fdr-sdk/navigation";
import { Turbopuffer } from "@turbopuffer/turbopuffer";
import {
  LoadDocsWithUrlPayload,
  loadDocsWithUrl,
} from "../../fdr/load-docs-with-url";
import { createTurbopufferRecords } from "../records/create-turbopuffer-records";
import { vectorizeTurbopufferRecords } from "../records/vectorize-turbopuffer-records";
import { FernTurbopufferAttributeSchema } from "../types";

interface TurbopufferIndexerTaskOptions {
  apiKey: string;
  namespace: string;
  payload: LoadDocsWithUrlPayload;

  /**
   * Whether the page is authed or not.
   */
  authed?: (node: NavigationNodePage) => boolean;

  /**
   * The vectorizer to use.
   */
  vectorizer: (chunk: string[]) => Promise<number[][]>;

  /**
   * Whether to delete the existing records before upserting.
   */
  deleteExisting?: boolean;
}

export async function turbopufferUpsertTask({
  apiKey,
  namespace,
  payload,
  authed,
  vectorizer,
  deleteExisting = false,
}: TurbopufferIndexerTaskOptions): Promise<number> {
  const tpuf = new Turbopuffer({
    apiKey,
    baseUrl: "https://gcp-us-east4.turbopuffer.com",
  });
  const ns = tpuf.namespace(namespace);

  // load the docs
  const { org_id, root, pages, domain } = await loadDocsWithUrl(payload);

  const unvectorizedRecords = await createTurbopufferRecords({
    root,
    domain,
    org_id,
    pages,
    authed,
  });

  const records = await vectorizeTurbopufferRecords(
    unvectorizedRecords,
    vectorizer
  );

  if (deleteExisting) {
    await ns.deleteAll();
  }

  await ns.upsert({
    vectors: records,
    distance_metric: "cosine_distance",
    schema: FernTurbopufferAttributeSchema,
  });

  return records.length;
}
