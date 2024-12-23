import { lstatSync } from "fs";
import { lstat } from "fs/promises";

export async function doesPathExist(filepath: string): Promise<boolean> {
  try {
    await lstat(filepath);
    return true;
  } catch {
    return false;
  }
}

export function doesPathExistSync(filepath: string): boolean {
  try {
    lstatSync(filepath);
    return true;
  } catch {
    return false;
  }
}
