import { atom, useAtom } from "jotai";

export type ValidSegmentationKeys = "endpoints" | "pages" | "fields";

const SEARCH_SEGMENTATION_ATOM = atom<ValidSegmentationKeys>("endpoints");
export const PAGE_HAS_SEARCHBAR_ATOM = atom<boolean>(false);

export function useSearchSegmentation(): [
  ValidSegmentationKeys,
  (value: ValidSegmentationKeys) => void,
] {
  return useAtom(SEARCH_SEGMENTATION_ATOM);
}
