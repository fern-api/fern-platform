import { atom, useAtom } from "jotai";

export type ValidSegmentationKeys = "endpoints" | "pages" | "fields";

const SEARCH_SEGMENTATION_ATOM = atom<"endpoints" | "pages" | "fields">("endpoints");

export function useSearchSegmentation(): [ValidSegmentationKeys, (value: ValidSegmentationKeys) => void] {
    return useAtom(SEARCH_SEGMENTATION_ATOM);
}
