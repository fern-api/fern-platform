import { atom, useAtomValue } from "jotai";
import { FernUser } from "../auth";

export const FERN_USER_ATOM = atom<FernUser | undefined>(undefined);

export function useFernUser(): FernUser | undefined {
    return useAtomValue(FERN_USER_ATOM);
}
