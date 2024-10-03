import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import type { FernUser } from "../auth";
import { DOCS_ATOM } from "./docs";

export const FERN_USER_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.user, isEqual);

FERN_USER_ATOM.debugLabel = "FERN_USER_ATOM";

export function useFernUser(): FernUser | undefined {
    return useAtomValue(FERN_USER_ATOM);
}
