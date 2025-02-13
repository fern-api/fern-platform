export type * from "hast";
export type { MdxJsxElementHast as MdxJsxElement } from "./declarations";
export type { MdxjsEsmHast as MdxjsEsm } from "mdast-util-mdxjs-esm";

declare module "hast" {
  interface ElementData {
    visited?: boolean;
    meta?: string | null;
    metastring?: string;
  }
}
