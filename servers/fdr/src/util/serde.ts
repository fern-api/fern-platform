import { LOGGER } from "../app/FdrApplication";

export function writeBuffer(val: unknown): Buffer {
  return Buffer.from(JSON.stringify(val), "utf-8");
}

export function readBuffer(val: Buffer): unknown {
  const raw = val.toString();
  try {
    return JSON.parse(raw);
  } catch (e) {
    LOGGER.error(`Failed to parse buffer: ${raw}`);
    throw e;
  }
}
