import { atom } from "jotai";

export const IS_LOCAL_PREVIEW_ATOM = atom<boolean>(false);
IS_LOCAL_PREVIEW_ATOM.debugLabel = "IS_LOCAL_PREVIEW_ATOM";
