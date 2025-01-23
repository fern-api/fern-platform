export type * from "hast";
export type { MdxJsxElementHast as MdxJsxElement } from "./declarations";

declare module "hast" {
  interface ElementData {
    visited?: boolean;
    meta?: string | null;
    metastring?: string;
  }
}
