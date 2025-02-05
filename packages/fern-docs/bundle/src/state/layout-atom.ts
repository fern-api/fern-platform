import type { Frontmatter } from "@fern-api/fdr-sdk/docs";
import { atom } from "jotai";

export const layoutAtom = atom<NonNullable<Frontmatter["layout"]>>("guide");
