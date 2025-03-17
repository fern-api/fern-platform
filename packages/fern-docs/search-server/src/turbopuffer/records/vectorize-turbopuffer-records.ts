import { zipWith } from "es-toolkit/array";
<<<<<<< HEAD
=======
import { encode } from "gpt-tokenizer";

>>>>>>> 3d6d6f513 (hotfix: Stop /turbopuffer/reindex from crashing by sanitizing input tokens (#2353))
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
