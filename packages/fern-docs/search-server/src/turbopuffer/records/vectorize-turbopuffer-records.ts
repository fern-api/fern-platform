import { zipWith } from "es-toolkit/array";

import {
  FernTurbopufferRecord,
  FernTurbopufferRecordWithoutVector,
} from "../types";

export async function vectorizeTurbopufferRecords(
  records: FernTurbopufferRecordWithoutVector[],
  vectorizer: (chunk: string[]) => Promise<number[][]>
): Promise<FernTurbopufferRecord[]> {
  const chunks = records.map((record) => record.attributes.chunk);
  const vectors = await vectorizer(chunks);
  return zipWith(records, vectors, (record, vector) => ({
    ...record,
    vector,
  }));
}
