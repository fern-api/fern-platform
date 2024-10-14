import type { FernUser } from "@fern-ui/fern-docs-auth";
import { isEqual } from "es-toolkit/predicate";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { DOCS_ATOM } from "./docs";

export const FERN_USER_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.user, isEqual);

FERN_USER_ATOM.debugLabel = "FERN_USER_ATOM";

export function useFernUser(): FernUser | undefined {
    return useAtomValue(FERN_USER_ATOM);
}
