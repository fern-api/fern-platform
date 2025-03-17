import { zipWith } from "es-toolkit/array";
import { encode } from "gpt-tokenizer";

import {
  FernTurbopufferRecord,
  FernTurbopufferRecordWithoutVector,
} from "../types";

export async function vectorizeTurbopufferRecords(
  records: FernTurbopufferRecordWithoutVector[],
  vectorizer: (chunk: string[]) => Promise<number[][]>
): Promise<FernTurbopufferRecord[]> {
  let chunks = records.map((record) => record.attributes.chunk);
  chunks = chunks.filter(
    (c) => encode(c).length <= 8190 && encode(c).length > 0
  );
  const vectors = await vectorizer(chunks);
  return zipWith(records, vectors, (record, vector) => ({
    ...record,
    vector,
  }));
}
