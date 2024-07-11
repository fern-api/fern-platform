import { atom, useAtomValue } from "jotai";
import { FernUser } from "../auth";

export const FERN_USER_ATOM = atom<FernUser | undefined>(undefined);

export function useFernUser(): FernUser | undefined {
    return useAtomValue(FERN_USER_ATOM);
}

// export const API_KEY_ATOM = atom<string | undefined>(undefined);

// export function useApiKey(): string | undefined {
//     return useAtomValue(API_KEY_ATOM);
// }
